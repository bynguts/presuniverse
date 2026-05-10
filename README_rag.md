# RAG Setup untuk Aria – President University Tour Guide

## Install dependencies

```bash
npm install vectra @xenova/transformers
```

## Struktur file

```
project/
├── knowledge_base.json       ← kamus dari Scrapling
├── rag/
│   ├── build-index.js        ← jalankan SEKALI untuk build index
│   ├── rag.js                ← module, import ke server kamu
│   └── vector-index/         ← dibuat otomatis oleh build-index.js
└── server.js                 ← Express server kamu
```

## Langkah setup

### 1. Build index (sekali saja)
```bash
node rag/build-index.js
```
Proses ini akan:
- Download model embedding ~25MB (sekali saja, lalu cache)
- Baca `knowledge_base.json`
- Potong jadi ~20 chunks per topik
- Simpan vector index ke `rag/vector-index/`

### 2. Integrasi ke server.js

```js
import { initRAG, retrieve } from './rag/rag.js';

// Saat server start:
await initRAG();

// Saat user tanya:
const context = await retrieve(userMessage); // hanya 4 chunk relevan
// → inject context ke system prompt AI
```

## Perbandingan sebelum vs sesudah

| | Sebelum (full JSON) | Sesudah (RAG) |
|---|---|---|
| Token per request | ~3000–5000 | ~300–600 |
| Latency | Lambat | Jauh lebih cepat |
| Akurasi | Kadang noise | Lebih fokus |

## Kapan perlu rebuild index?

Jalankan ulang `build-index.js` hanya kalau `knowledge_base.json` diupdate
(misalnya ada jurusan baru, info baru dari hasil scrape ulang).