/**
 * build-index.js
 * Jalankan SEKALI untuk membangun vector index dari knowledge base.
 * Usage: node build-index.js
 */

import { LocalIndex } from 'vectra';
import { pipeline } from '@xenova/transformers';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
const KB_PATH = join(__dirname, '..', 'pu_knowledge_clean.json');
const INDEX_PATH = join(__dirname, 'vector-index');
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ubah JSON knowledge base jadi array chunk teks yang siap di-embed.
 * Karena pu_knowledge_clean.json sudah dalam bentuk array, kita cukup memetakan datanya.
 */
function chunkKnowledgeBase(kb) {
  if (!Array.isArray(kb)) {
    console.error('KB is not an array. Please check the file structure.');
    return [];
  }

  return kb.map(item => ({
    topic: item.topic || 'General',
    text: `${item.title}: ${item.content}`.replace(/\s+/g, ' ').trim()
  })).filter(chunk => chunk.text.length > 20);
}


async function main() {
  console.log('📚 Membaca knowledge base...');
  const kb = JSON.parse(readFileSync(KB_PATH, 'utf-8'));
  const chunks = chunkKnowledgeBase(kb);
  console.log(`✂️  Total chunks: ${chunks.length}`);

  console.log('🤖 Memuat model embedding (download sekali ~25MB)...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const getEmbedding = async (text) => {
    const out = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(out.data);
  };

  mkdirSync(INDEX_PATH, { recursive: true });
  const index = new LocalIndex(INDEX_PATH);

  if (!await index.isIndexCreated()) {
    await index.createIndex();
  }

  console.log('🔢 Membuat embeddings dan menyimpan ke index...');
  for (let i = 0; i < chunks.length; i++) {
    const { topic, text } = chunks[i];
    const vector = await getEmbedding(text);
    await index.insertItem({ vector, metadata: { topic, text } });
    process.stdout.write(`\r   ${i + 1}/${chunks.length} chunks diproses`);
  }

  console.log('\n✅ Index selesai dibuat di:', INDEX_PATH);
  console.log('   Jalankan server.js untuk mulai menggunakan RAG.');
}

main().catch(console.error);