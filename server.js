import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// ── Knowledge Base initialized via Full Injection ───────────────────────────

// ── TTS Singleton ───────────────────────────────────────────────────────────
let ttsInstance = null;
let ttsReady = false;

const EDGE_TTS_VOICE = process.env.EDGE_TTS_VOICE || 'en-US-AriaNeural';

/**
 * Initializes and warms up the Edge TTS instance to ensure faster audio synthesis upon first request.
 * By pre-authenticating and setting metadata (voice ID and high-quality MP3 format) during server startup,
 * the latency of the very first Text-to-Speech generation is significantly reduced.
 */
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

/**
 * Loads AI provider configurations (e.g., Ollama, OpenRouter) from config.json and splits them into
 * primary and fallback pools. This enables a resilient architecture where the system can automatically
 * fallback to local models (Ollama) if the primary cloud provider (OpenRouter) fails or runs out of credits.
 */
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

// ── Load Full Knowledge Base once at startup ─────────────────────────────
/**
 * Synchronously loads the entire knowledge base from the `pu_knowledge_clean.json` file.
 * The JSON structure is parsed and formatted into a single comprehensive string.
 * This string is then injected directly into the system prompt for every chat request,
 * acting as a zero-latency alternative to traditional RAG (Retrieval-Augmented Generation).
 */
const KB_PATH = path.join(__dirname, 'pu_knowledge_clean.json');
let FULL_KNOWLEDGE_BASE = "";

try {
    const rawKb = JSON.parse(fs.readFileSync(KB_PATH, 'utf-8'));
    let kbString = "";
    for (const [category, topics] of Object.entries(rawKb)) {
        if (typeof topics === 'object' && topics !== null) {
            for (const [title, content] of Object.entries(topics)) {
                kbString += `### [${category}] ${title}\n${content}\n\n`;
            }
        } else {
            kbString += `### ${category}\n${topics}\n\n`;
        }
    }
    FULL_KNOWLEDGE_BASE = kbString.trim();
    console.log(`[System] Knowledge Base Loaded: ${FULL_KNOWLEDGE_BASE.length} characters.`);
} catch (err) {
    console.error('[System] Failed to load KB:', err.message);
}

/**
 * Handles incoming chat requests from the frontend, injects the full knowledge base into the system prompt,
 * and manages the streaming response back to the client.
 * 
 * Flow:
 * 1. Injects the pre-loaded `FULL_KNOWLEDGE_BASE` into the system prompt to provide factual context.
 * 2. Attempts to stream the response using the Primary AI provider (OpenRouter) to ensure high-quality answers.
 * 3. Parses the incoming Server-Sent Events (SSE) from the provider and forwards them chunk-by-chunk to the client.
 * 4. If the Primary provider fails (e.g., network error, timeout), it automatically switches to the Fallback pool (Ollama).
 */
app.post('/api/chat', async (req, res) => {
    let messages = req.body.messages || [];

    // ── Full Knowledge Injection (Replacing RAG) ─────────────────────────
    const sysIdx = messages.findIndex(m => m.role === 'system');
    const knowledgeStr = `\n\n[UNIVERSITAS PRESIDEN - SOURCE OF TRUTH]:\n${FULL_KNOWLEDGE_BASE}`;

    if (sysIdx !== -1) {
        if (!messages[sysIdx].content.includes('[UNIVERSITAS PRESIDEN')) {
            messages[sysIdx].content += knowledgeStr;
        }
    } else {
        messages.unshift({ 
            role: 'system', 
            content: `You are ARIA, the professional tour guide for President University. 
            
            IMPORTANT GUIDELINES:
            1. There are EXACTLY 7 faculties at President University. ALWAYS say 7 if asked for the count.
            2. Use the [SOURCE OF TRUTH] below for ALL factual answers.
            3. If the user asks about an acronym like "IMPACT", look for the section title or related content and explain it based on the text.
            4. Be proactive: if a term is mentioned in the text, assume it's part of the university's identity and explain it.
            5. Keep responses concise (2-4 sentences) and friendly.
            6. Be extremely flexible with typos or slang. If a word looks similar to a topic in the [SOURCE OF TRUTH], assume that's what the user means.
            
            ${knowledgeStr}` 
        });
    }

    // 1. Coba OpenRouter (Primary)
    for (const keyEntry of fallbackPool) {
        try {
            console.log(`[Chat] Streaming Primary: ${keyEntry.name} (${keyEntry.model})`);
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
            console.error(`[Chat] Primary stream error:`, err.message);
        }
    }

    // 2. Fallback ke Ollama jika OpenRouter gagal
    console.warn(`[Chat] OpenRouter failed or exhausted. Switching to Ollama Fallback...`);
    for (let i = 0; i < ollamaPool.length; i++) {
        const keyEntry = ollamaPool[currentOllamaIndex];
        currentOllamaIndex = (currentOllamaIndex + 1) % ollamaPool.length;

        try {
            console.log(`[Chat] Streaming Ollama fallback key ${currentOllamaIndex}/${ollamaPool.length} (${keyEntry.model})`);
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
            console.warn(`[Chat] Ollama fallback failed: ${response.status} - ${errText}`);
        } catch (err) {
            console.error(`[Chat] Ollama fallback error:`, err.message);
        }
    }

    res.write(`data: ${JSON.stringify({ error: 'All AI providers failed.' })}\n\n`);
    res.end();
});


/**
 * Utility function to execute a streaming API call to the currently selected AI provider.
 * This dynamically constructs the request body based on whether the provider is Ollama or OpenRouter.
 * 
 * Note on Context Window:
 * If the provider is Ollama (local model), it forces the `num_ctx` to 100,000. This is crucial because
 * we inject the *entire* Knowledge Base (pu_knowledge_clean.json) into the system prompt. Without this,
 * Ollama would truncate the context and forget university facts.
 * 
 * @param {Object} keyEntry - The active provider configuration object (URL, API key, model name).
 * @param {Array} messages - The conversational history array including the system prompt.
 * @param {Object} body - The original request body containing max_tokens and temperature settings.
 * @returns {Promise<Response>} The fetch Response object containing the active data stream.
 */
async function callAIStream(keyEntry, messages, body) {
    const isOllama = keyEntry.name.includes('ollama');
    const requestBody = {
        model: keyEntry.model,
        messages: messages,
        max_tokens: body.max_tokens || 450,
        temperature: body.temperature || 0.7,
        stream: true
    };
    // Set context window to 100k. Perfect for Full KB Injection.
    if (isOllama) requestBody.options = { num_ctx: 100000 };

    return fetch(`${keyEntry.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyEntry.apiKey}`,
            ...keyEntry.headers
        },
        body: JSON.stringify(requestBody)
    });
}

/**
 * Endpoint: /api/tts
 * Handles Text-to-Speech (TTS) conversion using the Microsoft Edge TTS library.
 * It streams the generated audio buffer directly back to the client as an MP3.
 * 
 * Flow:
 * 1. Accepts the text either via GET query params (for quick streaming) or POST body (for long texts).
 * 2. Checks if the `ttsInstance` is ready; if not, it triggers `warmUpTTS()` to re-authenticate.
 * 3. Pipes the audio stream generated by the Edge TTS library directly to the Express response (`res.pipe`).
 * 4. Implements an automatic retry mechanism: if the stream drops mid-generation, it re-warms and tries again.
 */
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
                // Keep it ready for next sentence
                // ttsReady = true; 
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

/**
 * Endpoint: /api/stt
 * Handles Speech-to-Text (STT) requests by proxying raw audio buffers to a local Whisper.cpp server.
 * This is used primarily as a fallback when the browser's native Web Speech API isn't available.
 * 
 * Flow:
 * 1. Validates that the incoming request contains binary audio data.
 * 2. Wraps the binary Buffer into a `FormData` object with the file name 'voice.wav'.
 * 3. Appends necessary configuration flags (`language`, `response_format`).
 * 4. Forwards the payload to the local Whisper.cpp HTTP server (usually running on port 9000).
 * 5. Returns the transcribed JSON text back to the frontend.
 */
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

