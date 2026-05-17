# 🏛️ PresUniverse: Virtual Campus Tour with ARIA AI Guide

PresUniverse is an immersive, presentation-ready virtual tour application for **President University**. Designed to provide prospective students and visitors with a high-tech exploration experience, it features **ARIA**, a highly responsive voice-enabled AI assistant that guides users through campus buildings via interactive 360-degree views.

---

## 🚀 Key Features & Architecture

- **🤖 ARIA AI Assistant (Dual-Provider)**: Powered by a resilient backend architecture that uses OpenRouter as the primary LLM API, with an automatic fallback to local Ollama models ensuring 100% uptime during presentations.
- **🗣️ Advanced Voice Pipeline**:
  - **Dual-Stage STT (Speech-to-Text)**: Prioritizes the ultra-fast browser Web Speech API, with an automatic fallback to a local **Whisper.cpp** HTTP server proxy for privacy-first, offline transcription.
  - **Low-Latency TTS (Text-to-Speech)**: Utilizes Microsoft Edge TTS with server-side warming and a custom frontend **Audio Queue System** for seamless, overlapping-free voice synthesis.
- **📍 Interactive 360° Tour**: Seamless integration with Momento360 for high-fidelity panoramas, featuring dynamic UI synchronization and programmatic scene teleportation.
- **⚡ Zero-Latency RAG**: Full injection of the `pu_knowledge_clean.json` knowledge base into the AI's system prompt at server startup, eliminating database retrieval latency and ensuring perfect factual accuracy.

---

## 🛠️ Tech Stack & Engineering

### Frontend (Client-Side)
- **HTML5 & Vanilla JavaScript**: Core logic (`tour.js`) heavily documented with JSDoc for academic and presentation clarity.
- **CSS3**: Custom dark-themed design system, glassmorphism UI, and fluid CSS animations.
- **Browser APIs**: `MediaRecorder`, `AudioContext`, and `SpeechRecognition` for native multi-modal input.

### Backend (Server-Side)
- **Node.js & Express**: Acts as a secure proxy gateway to hide API keys, handle audio resampling, and manage AI Server-Sent Events (SSE) streaming.
- **Whisper.cpp**: Native C++ local inference server for STT transcription (supports NVIDIA CUDA/Vulkan acceleration).
- **msedge-tts**: Unofficial Edge TTS module integrated into the Node.js backend.

---

## 📦 Installation & Setup

### Prerequisites
1. **Node.js**: v18 or later (Required for native `fetch` and `FormData` support).
2. **Whisper.cpp**: Compiled server executable placed in `whisper.cpp/build/bin/Release/`.
3. **Whisper Model**: Download `ggml-small.bin` and place it in the `whisper.cpp/models/` directory.

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/bynguts/presuniverse.git
   cd presuniverse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *Make sure `EDGE_TTS_VOICE` and `WHISPER_SERVER_URL` are set correctly.*

4. **Prepare AI Config**:
   Ensure `config.json` is properly formatted with your OpenRouter or Ollama API keys.

---

## 🚦 How to Run

### Automatic Startup (Windows)
Run the included batch script to launch both the Whisper.cpp STT server and the Node.js backend simultaneously:
```cmd
start-all.bat
```
> **Note for Presenters**: If the Whisper Command Prompt crashes upon startup, edit `start-all.bat` and remove the `--device 1` flag to force CPU rendering.

### Manual Startup
1. **Start Whisper Server (Port 9000)**:
   ```bash
   cd whisper.cpp/build/bin/Release
   whisper-server.exe -m ..\..\..\models\ggml-small.bin --port 9000
   ```
2. **Start Backend (Port 3000)**:
   ```bash
   node server.js
   ```
3. **Access the App**:
   Open `http://localhost:3000` in your web browser.

---

## 📂 Project Structure

```text
presuniverse/
├── public/                 # Frontend UI, CSS, and Client Logic
│   ├── index.html          # Main landing page & slider logic
│   ├── tour.html           # Virtual tour 360 viewer shell
│   └── assets/js/tour.js   # Brain of the frontend (STT, TTS queues, AI streaming)
├── server.js               # Express Backend (API Gateway, AI Fallback, TTS Proxy)
├── pu_knowledge_clean.json # Static Knowledge Base for Zero-Latency RAG
├── whisper.cpp/            # High-performance C++ local STT server
├── start-all.bat           # Windows deployment script
├── config.json             # AI provider and model routing configs
└── .env                    # System variables and voice selection
```

---

## 📖 Presentation Notes
The codebase has been thoroughly annotated using standard **JSDoc** formatting in `server.js`, `tour.js`, and `index.html`. These comments explain the "Why" and "How" of the system's architecture, making it easy for any group member to read the source code and present the logic behind the audio queueing, AI streaming, and proxy fallback systems.

---

## 🛡️ License
This project is licensed under the **ISC License**.

*Built with ❤️ for President University.*
