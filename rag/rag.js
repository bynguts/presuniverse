/**
 * rag.js
 * Module RAG untuk Aria. Import ini di server Express kamu.
 * 
 * Usage:
 *   import { initRAG, retrieve } from './rag/rag.js';
 *   await initRAG();                        // panggil sekali saat server start
 *   const context = await retrieve(query);  // panggil setiap ada pertanyaan
 */

import { LocalIndex } from 'vectra';
import { pipeline } from '@xenova/transformers';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = join(__dirname, 'vector-index');

let index = null;
let embedder = null;

/**
 * Inisialisasi RAG — panggil sekali saat server start.
 * Memuat model embedding ke memori (~25MB, butuh beberapa detik pertama kali).
 */
export async function initRAG() {
  console.log('[RAG] Memuat embedding model...');
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  index = new LocalIndex(INDEX_PATH);
  console.log('[RAG] Siap.');
}

/**
 * Cari chunk paling relevan untuk pertanyaan user.
 * @param {string} query      - pertanyaan user
 * @param {number} topK       - jumlah chunk yang diambil (default 4)
 * @returns {string}          - konteks siap disuntik ke prompt AI
 */
export async function retrieve(query, topK = 4) {
  if (!index || !embedder) throw new Error('RAG belum diinisialisasi. Panggil initRAG() dulu.');

  const out = await embedder(query, { pooling: 'mean', normalize: true });
  const queryVector = Array.from(out.data);

  const results = await index.queryItems(queryVector, topK);

  if (results.length === 0) return '';

  return results
    .map(r => r.item.metadata.text)
    .join('\n\n');
}