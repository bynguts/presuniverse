# 🏛️ PresUniverse: Virtual Campus Tour with ARIA AI Guide

PresUniverse is an immersive virtual tour application for **President University**, designed to provide prospective students and visitors with a high-tech, interactive exploration experience. Guided by **ARIA**, a voice-enabled AI assistant, users can navigate the campus, visit buildings through 360-degree-like experiences, and ask questions in real-time.

---

## 🚀 Key Features

- **🤖 ARIA AI Assistant**: A professional tour guide powered by Large Language Models (Ollama/OpenRouter). ARIA knows everything about President University from its curricula to facilities.
- **🗣️ Voice & Speech Integration**:
  - **Speech-to-Text (STT)**: Talk to ARIA naturally using a local high-performance Whisper.cpp server.
  - **Text-to-Speech (TTS)**: ARIA responds with natural-sounding voices using Microsoft Edge TTS.
- **📍 Interactive Virtual Tour**: Explore various campus buildings with smooth transitions, hotspot navigation, and dynamic sliders.
- **📚 Smart Knowledge Base**: ARIA uses a "Source of Truth" knowledge injection system to ensure 100% factual accuracy regarding university information.
- **🎮 Immersive UI**: A modern, dark-themed interface with glassmorphism effects and micro-animations for a premium feel.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & Vanilla JavaScript**: Core application logic.
- **CSS3**: Custom design system with modern aesthetics.
- **SessionStorage & LocalStorage**: State management for tour navigation.

### Backend
- **Node.js & Express**: API gateway for chat, TTS, and STT.
- **Ollama**: Local AI inference for primary chat capabilities.
- **Whisper.cpp**: High-speed, local speech recognition.
- **msedge-tts**: Cloud-grade voice synthesis.

---

## 📦 Installation

### Prerequisites
1. **Node.js**: v18 or later.
2. **Ollama**: (Optional but recommended) for local AI hosting.
3. **Whisper.cpp**: Build the server from source in the `whisper.cpp` directory.

### Setup Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/bynguts/presuniverse.git
   cd presuniverse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys (OpenRouter, etc.) and server configurations.

4. **Prepare AI Config**:
   Create a `config.json` file to define your AI providers (Ollama or OpenRouter).

---

## 🚦 How to Run

### Automatic Startup (Windows)
Simply run the included batch script to launch both the Whisper server and the Express backend:
```bash
start-all.bat
```

### Manual Startup
1. **Start Whisper Server**:
   ```bash
   cd whisper.cpp/build/bin/Release
   whisper-server.exe -m models/ggml-small.bin --port 9000
   ```
2. **Start Backend**:
   ```bash
   npm start
   ```
3. **Open the App**:
   Visit `http://localhost:3000` in your browser.

---

## 📂 Project Structure

```text
presuniverse/
├── public/                 # Frontend assets and pages
│   ├── index.html          # Main landing and ARIA interface
│   ├── tour.html           # Virtual tour viewer
│   └── assets/             # Images, sounds, and media
├── server.js               # Node.js backend & API endpoints
├── pu_knowledge_clean.json # AI's factual knowledge base
├── whisper.cpp/            # Submodule/directory for STT server
├── start-all.bat           # One-click launcher script
├── config.json             # AI provider configurations
└── .env                    # Environment variables
```

---

## 🛡️ License
This project is licensed under the **ISC License**.

---

*Built with ❤️ for President University.*
