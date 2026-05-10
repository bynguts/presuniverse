# PresUniverse — Virtual Campus Tour with AI Guide

## Quick Start

### Step 1 — Setup API Key (for ARIA AI Guide)
1. Get a free key at https://openrouter.ai/keys
2. Open `tour.html`, find the line:
   ```js
   const OPENROUTER_KEY = 'YOUR_OPENROUTER_API_KEY_HERE';
   ```
   Replace with your key.

### Step 2 — Setup Whisper.cpp (for Voice Notes)
Voice notes are processed **100% locally and free** using Whisper.cpp.

**Mac / Linux:**
```bash
bash start-whisper.sh
```

**Windows:**
```
Double-click start-whisper.bat
```

The first run will:
- Clone whisper.cpp from GitHub (~50MB)
- Build the server binary (~1-2 min)
- Download the `medium` multilingual model (~1.5 GB, one-time)
- Start the server at http://localhost:8080

### Step 3 — Open the Tour
Open `index.html` in your browser (Chrome recommended).

---

## Supported Languages (Voice)
Whisper medium model supports 99+ languages including:
Indonesian, English, Chinese, Japanese, Korean, Arabic, French, Spanish, German, and more.
Language is auto-detected — no need to configure.

---

## File Structure
```
presuniverse/
├── index.html          <- Landing page
├── tour.html           <- 360° Tour + ARIA AI Guide + Whisper Voice
├── style.index.css     <- Landing page styles
├── .env                <- Config reference (API keys & settings)
├── start-whisper.sh    <- Mac/Linux: setup & run Whisper server
├── start-whisper.bat   <- Windows: setup & run Whisper server
└── README.md
```

---

## Changing Whisper Model
Edit `start-whisper.sh` (or `.bat`) and change `medium` to:
- `tiny` — 75MB, fastest (good for testing)
- `small` — 466MB, good balance
- `medium` — 1.5GB, best multilingual (recommended)
- `large` — 2.9GB, most accurate (needs good CPU/GPU)
