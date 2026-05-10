import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { initRAG, retrieve } from './rag/rag.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Global Error Handling (Anti-Crash) ──────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Anti-Crash] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[Anti-Crash] Uncaught Exception:', err.message);
    if (err.message.includes('ENOTFOUND')) {
        console.warn('[TTS] Network issue detected. Server remains alive.');
    }
});

const app = express();
app.use(cors());
app.use(express.json());

// ── Init RAG (Vector Index) ──────────────────────────────────────────────────
await initRAG();

// ── TTS Singleton ───────────────────────────────────────────────────────────
let ttsInstance = null;
let ttsReady = false;

const EDGE_TTS_VOICE = process.env.EDGE_TTS_VOICE || 'en-US-AriaNeural';

async function warmUpTTS() {
    try {
        console.log('[TTS] Warming up Edge TTS...');
        ttsInstance = new MsEdgeTTS();
        await ttsInstance.setMetadata(EDGE_TTS_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        ttsReady = true;
        console.log(`[TTS] Warm-up complete. Voice: ${EDGE_TTS_VOICE}`);
    } catch (err) {
        ttsReady = false;
        console.error('[TTS] Warm-up failed:', err.message);
    }
}
warmUpTTS();

// Add raw body parser for raw audio/wav binary uploads (STT pipeline)
app.use(express.raw({ type: 'audio/wav', limit: '10mb' }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const WHISPER_SERVER_URL = process.env.WHISPER_SERVER_URL || 'http://localhost:9000/inference';
const WHISPER_LANGUAGE = process.env.WHISPER_LANGUAGE || 'en';

app.get('/api/config', (req, res) => {
    res.json({ WHISPER_SERVER_URL, WHISPER_LANGUAGE });
});

// ── Load AI Configuration (Primary: Ollama, Fallback: OpenRouter) ─────────────
let ollamaPool = [];
let fallbackPool = [];
let currentOllamaIndex = 0;

function loadAIConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const oPool = [];
            const fPool = [];
            
            config.providers.forEach(provider => {
                provider.keys.forEach(key => {
                    const entry = {
                        name: provider.name,
                        apiKey: key,
                        baseUrl: provider.baseUrl,
                        model: provider.model,
                        headers: provider.headers || {}
                    };
                    if (provider.name.includes('ollama')) oPool.push(entry);
                    else fPool.push(entry);
                });
            });

            ollamaPool = oPool;
            fallbackPool = fPool;
            console.log(`[AI Config] Loaded ${ollamaPool.length} Ollama keys and ${fallbackPool.length} Fallback keys.`);
        }
    } catch (err) {
        console.error('[AI Config] Failed to load config.json:', err.message);
    }
}
loadAIConfig();

app.post('/api/chat', async (req, res) => {
    let messages = req.body.messages || [];

    // ── 🚀 RAG: VECTOR SEARCH RETRIEVAL 🚀 ──
    const lastUserMsg = messages.slice().reverse().find(m => m.role === 'user');
    const query = lastUserMsg ? lastUserMsg.content : "";
    
    console.log(`[RAG] Searching vector index for: "${query.substring(0, 50)}..."`);
    const relevantContext = await retrieve(query, 4);

    if (relevantContext) {
        const sysIdx = messages.findIndex(m => m.role === 'system');
        const knowledgeStr = `\n\n[CONTEXT]: ${relevantContext.substring(0, 1000)}`; 
        
        if (sysIdx !== -1) {
            if (!messages[sysIdx].content.includes('[CONTEXT]')) {
                messages[sysIdx].content += knowledgeStr;
            }
        } else {
            messages.unshift({ role: 'system', content: `You are ARIA, the guide.${knowledgeStr}` });
        }
    }

    // 1. Coba semua key Ollama dulu (Round Robin, STREAMING)
    for (let i = 0; i < ollamaPool.length; i++) {
        const keyEntry = ollamaPool[currentOllamaIndex];
        currentOllamaIndex = (currentOllamaIndex + 1) % ollamaPool.length;

        try {
            console.log(`[Chat] Streaming Ollama key ${currentOllamaIndex}/${ollamaPool.length} (${keyEntry.model})`);
            const response = await callAIStream(keyEntry, messages, req.body);
            if (response.ok) {
                // ── Setup SSE headers ──
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                res.flushHeaders();

                // ── Pipe token stream ke browser ──
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

                    for (const line of lines) {
                        const raw = line.slice(6).trim();
                        if (raw === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(raw);
                            const token = parsed.choices?.[0]?.delta?.content || '';
                            if (token) {
                                fullText += token;
                                res.write(`data: ${JSON.stringify({ token })}\n\n`);
                            }
                        } catch { /* skip malformed chunks */ }
                    }
                }

                res.write(`data: ${JSON.stringify({ done: true, full: fullText })}\n\n`);
                res.end();
                return;
            }
            const errText = await response.text();
            console.warn(`[Chat] Ollama stream failed: ${response.status} - ${errText}`);
        } catch (err) {
            console.error(`[Chat] Ollama stream error:`, err.message);
        }
    }

    // 2. Fallback ke OpenRouter jika semua Ollama gagal
    console.warn(`[Chat] ALL Ollama keys exhausted. Switching to Fallback...`);
    for (const keyEntry of fallbackPool) {
        try {
            console.log(`[Chat] Streaming Fallback: ${keyEntry.name} (${keyEntry.model})`);
            const response = await callAIStream(keyEntry, messages, req.body);
            if (response.ok) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                res.flushHeaders();

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
                    for (const line of lines) {
                        const raw = line.slice(6).trim();
                        if (raw === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(raw);
                            const token = parsed.choices?.[0]?.delta?.content || '';
                            if (token) {
                                fullText += token;
                                res.write(`data: ${JSON.stringify({ token })}\n\n`);
                            }
                        } catch { }
                    }
                }

                res.write(`data: ${JSON.stringify({ done: true, full: fullText })}\n\n`);
                res.end();
                return;
            }
        } catch (err) {
            console.error(`[Chat] Fallback stream error:`, err.message);
        }
    }

    res.write(`data: ${JSON.stringify({ error: 'All AI providers failed.' })}\n\n`);
    res.end();
});


async function callAIStream(keyEntry, messages, body) {
    return fetch(`${keyEntry.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyEntry.apiKey}`,
            ...keyEntry.headers
        },
        body: JSON.stringify({
            model: keyEntry.model,
            messages: messages,
            max_tokens: body.max_tokens || 450,
            temperature: body.temperature || 0.8,
            stream: true   // ⬅️ KUNCI: token mengalir langsung
        })
    });
}

app.all('/api/tts', async (req, res) => {
    try {
        const text = req.method === 'GET' ? req.query.text : req.body.text;
        if (!text) return res.status(400).json({ error: 'Text is required.' });

        if (!ttsReady) {
            console.log('[TTS] Not ready, re-warming...');
            await warmUpTTS();
        }

        try {
            const { audioStream } = await ttsInstance.toStream(text);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            audioStream.pipe(res);

            audioStream.on('end', () => {
                ttsReady = false;
                warmUpTTS();
            });
        } catch (streamErr) {
            console.warn('[TTS] Stream error, re-warming and retrying...', streamErr.message);
            await warmUpTTS();
            const { audioStream } = await ttsInstance.toStream(text);
            res.setHeader('Content-Type', 'audio/mpeg');
            audioStream.pipe(res);
        }
    } catch (error) {
        console.error('[Backend TTS Error]:', error.message || error);
        if (!res.headersSent) res.status(500).json({ error: 'TTS synthesis failed.' });
    }
});

app.post('/api/stt', async (req, res) => {
    try {
        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
            return res.status(400).json({ error: 'Audio data is required.' });
        }

        const fd = new FormData();
        const audioFile = new Blob([req.body], { type: 'audio/wav' });
        fd.append('file', audioFile, 'voice.wav');
        fd.append('language', WHISPER_LANGUAGE);
        fd.append('response_format', 'json');

        const response = await fetch(WHISPER_SERVER_URL, {
            method: 'POST',
            body: fd
        });

        if (!response.ok) throw new Error(`Local Whisper server returned status ${response.status}`);

        const data = await response.json();
        const localTranscript = data.text || data.results?.[0]?.transcript || data.transcription || "";

        console.log(`[STT] Local Whisper success: "${localTranscript}"`);
        return res.json({ text: localTranscript.trim(), provider: 'local' });

    } catch (err) {
        console.error('[STT Endpoint Error]:', err.message);
        res.status(500).json({ error: err.message || 'Speech-to-Text transcription failed.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running securely on http://localhost:${PORT}`);
});

