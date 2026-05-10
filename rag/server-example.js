/**
 * Contoh integrasi RAG ke server Express Aria yang sudah ada.
 * Ini bukan file lengkap — tunjukkan bagian mana yang perlu ditambah/ganti.
 */

import express from 'express';
import { initRAG, retrieve } from './rag.js';

const app = express();
app.use(express.json());

// ── 1. Init RAG saat server start ─────────────────────────────────────────────
await initRAG(); // tambahkan ini di server.js kamu


// ── 2. Endpoint chat Aria (ganti endpoint chat kamu yang lama) ────────────────
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  // Ambil konteks yang relevan saja (bukan seluruh JSON!)
  const context = await retrieve(message);

  // Kirim ke LLM dengan konteks yang sudah dipersempit
  const response = await fetch('https://ollama.com/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gemma4:31b',
      stream: false,
      messages: [
        {
          role: 'system',
          content: `Kamu adalah Aria, AI Tour Guide President University yang ramah dan informatif.
Jawab pertanyaan menggunakan informasi berikut. Jika tidak ada dalam konteks, katakan kamu tidak tahu.

=== KONTEKS ===
${context}
===============`
        },
        {
          role: 'user',
          content: message
        }
      ]
    })
  });

  const data = await response.json();
  const reply = data.message?.content ?? 'Maaf, saya tidak bisa menjawab saat ini.';

  res.json({ reply });
});

app.listen(3000, () => console.log('Aria running on http://localhost:3000'));