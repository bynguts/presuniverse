// ── DATA ────────────────────────────────────────────────────────────────────
const LOCS = [

    { id:'lobby',     name:'Campus Lobby',                emoji:'🏛️', kw:['lobby','entrance','main','masuk','depan','hall','aula'],
      link:'https://momento360.com/e/u/67dfe1cb293d49c5bd6191ac6355af3f?utm_campaign=embed&utm_source=other&heading=-44.62&pitch=20.64&field-of-view=75',
      desc:'The grand main entrance and welcoming hub of President University — visitors first step into this elegant lobby before exploring campus.' },
    { id:'library',   name:'Library',                    emoji:'📚', kw:['library','perpustakaan','buku','book','read','baca','pustaka'],
      link:'https://momento360.com/e/u/86ed496a88644e66856a147e0fd5de94?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=100&size=medium&display-plan=true',
      desc:'A modern multi-story library with thousands of academic books, digital resources, private study rooms, and comfortable reading areas.' },
    { id:'fablab',    name:'Fablab',                     emoji:'🔧', kw:['fablab','lab','maker','fabrication','3d','print','workshop','mesin'],
      link:'https://momento360.com/e/u/7424e69d3e35472b948e5a0f4e7c6439?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'A state-of-the-art fabrication lab with 3D printers, laser cutters, CNC machines, and electronics workstations for hands-on innovation.' },
    { id:'cafe',      name:'Cafe',                       emoji:'☕', kw:['cafe','coffee','food','makan','minum','kantin','cafeteria','restaurant','resto','kopi','warung','jajan'],
      link:'https://momento360.com/e/u/c2f6450ff339461d8bdc726d106c0e76?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'A cozy campus cafe offering meals, snacks, and beverages — the perfect place to relax, eat, and collaborate with friends between classes.' },
    { id:'interior',  name:'Interior Design Classroom',  emoji:'🎨', kw:['interior','design','art','creative','classroom','studio','seni'],
      link:'https://momento360.com/e/u/ee7b26e299d04a18990e1e869149cf78?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'A professional creative studio for Interior Design students with rendering workstations, material samples, and design review spaces.' },
    { id:'pool',      name:'Swimming Pool',               emoji:'🏊', kw:['pool','swim','kolam','renang','sport','olahraga','swimming'],
      link:'https://momento360.com/e/u/eb0be281cd7547d9a5b55dee9abc6b00?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'An Olympic-standard indoor swimming pool supporting varsity athletes, PE classes, and recreational swimming for all students.' },
    { id:'gamedev',   name:'Game Development Classroom', emoji:'🎮', kw:['game','gaming','gamedev','developer','coding','programming','komputer','computer'],
      link:'https://momento360.com/e/u/0d6f410a3f6d46e298cec9f0524ddb90?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'A cutting-edge game dev lab with high-performance gaming PCs, development tools (Unity, Unreal), and collaborative project spaces.' },
    { id:'buildingB', name:'Building B (Classroom)',      emoji:'🏢', kw:['building b','gedung b','classroom','kelas','ruang kelas'],
      link:'https://momento360.com/e/u/ac812ecf42544adf8a636c06a7972bdc?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'General-purpose academic classrooms in Building B, equipped with projectors, air conditioning, and modern furniture for comfortable learning.' },
    { id:'golf',      name:'Golf Club',                   emoji:'⛳', kw:['golf','sport','green','club','recreation','lapangan'],
      link:'https://momento360.com/e/u/3fe0e34dcb764b62b62a2db150872091?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'A private golf club and driving range on campus grounds — one of the unique perks of studying at President University.' },
    { id:'buildingA', name:'Building A (Classroom)',      emoji:'🏫', kw:['building a','gedung a','classroom','kelas','lecture'],
      link:'https://momento360.com/e/u/f3254bbdd89743f9ba6b2c5db7a6c890?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'The main academic building with large lecture halls and seminar rooms for a variety of faculties and programs.' },
    { id:'law',       name:'Classroom for Law Student',   emoji:'⚖️', kw:['law','hukum','legal','moot court','mahkamah','pengadilan'],
      link:'https://momento360.com/e/u/0e1410fe2b4c436ea8f469b88e15050c?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium&display-plan=true',
      desc:'Specialized moot court and seminar rooms for Faculty of Law students, designed to simulate real courtroom environments.' },
];

const SUGGS = {
    lobby:     ['Where is the cafe? ☕','Show me the library 📚','What facilities are available?'],
    library:   ['How many books are here?','Show me the Fablab 🔧','Where can I eat? 🍽️'],
    cafe:      ['What food is available? 🍕','Take me to the pool 🏊','Back to lobby 🏛️'],
    pool:      ['Tell me about sports here','Show me Golf Club ⛳','Where is Game Dev? 🎮'],
    fablab:    ['What machines are available?','Show me Game Dev class 🎮','Any design studios?'],
    gamedev:   ['What software do they use?','Show me Fablab 🔧','Where is Building B?'],
    golf:      ['Is this open to all students?','Show me the pool 🏊','Tell me more about sports'],
    interior:  ['What programs are in this building?','Show me Building A','Where is the library?'],
    buildingA: ['Show me Building B','Take me to the cafe ☕','What faculties are here?'],
    buildingB: ['Show me Building A','Take me to the library 📚','Where is the pool?'],
    law:       ['What is studied in law here?','Show me Building A','Take me to the library'],
    default:   ['Tell me about this room','Where is the cafe? ☕','Show me the library 📚'],
};

// ── STATE ────────────────────────────────────────────────────────────────────
let cur = 0;
let busy = false;
let history = [];
let panelOpen = false;
let isRec = false;

// Whisper recording state
let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;

// Sound and TTS State
let isSoundOn = true;
let currentAudio = null;

// ── AUDIO QUEUE SYSTEM (Ultra-Low Latency) ──────────────────────────────────
let audioQueue = [];
let isQueuePlaying = false;

async function playNextInQueue() {
    if (audioQueue.length === 0) {
        isQueuePlaying = false;
        const btn = document.getElementById('soundBtn');
        if (btn) btn.classList.remove('playing');
        return;
    }
    
    isQueuePlaying = true;
    const audioObj = audioQueue.shift();
    currentAudio = audioObj;
    
    audioObj.onended = () => {
        playNextInQueue();
    };
    
    try {
        await audioObj.play();
        const btn = document.getElementById('soundBtn');
        if (btn && isSoundOn) btn.classList.add('playing');
    } catch (e) {
        console.warn('[Queue Play Error]:', e);
        playNextInQueue();
    }
}

async function addToAudioQueue(text) {
    if (!isSoundOn || !text.trim()) return;
    const audio = await prepareTTS(text);
    if (audio) {
        audioQueue.push(audio);
        if (!isQueuePlaying) playNextInQueue();
    }
}

// ── INTERRUPT / ABORT STATE ─────────────────────────────────────────
let abortController = null; // AbortController for current fetch stream

// Stop everything ARIA is doing and reset state instantly
function interruptAria() {
    if (abortController) { abortController.abort(); abortController = null; }
    stopTTS();
    audioQueue = []; // Clear pending audio
    isQueuePlaying = false;
    hideDots();
    busy = false;
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.disabled = false;
}

// ── WHISPER / WEB SPEECH API VOICE NOTE ───────────────────────────────────────
let recognition = null;
let clickedStop = false;
let WHISPER_URL = 'http://127.0.0.1:9000/inference';

// Fetch config from backend
async function loadConfig() {
    try {
        const res = await fetch('/api/config');
        if (res.ok) {
            const data = await res.json();
            WHISPER_URL = data.WHISPER_SERVER_URL || WHISPER_URL;
        }
    } catch (e) {
        console.warn("Failed to fetch config, using defaults", e);
    }
}
loadConfig();

async function toggleMic() {
    stopTTS(); // Immediately stop TTS when recording starts/toggles
    if (isRec) {
        stopRec();
    } else {
        await startRec();
    }
}

// 1. Web Speech API (Modern, Real-time, 100% Free, No Balance Required)
function startRecWebSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        // Use the dynamically selected language
        recognition.lang = currentSTTLang;
        
        recognition.onstart = () => {
            isRec = true;
            const btn = document.getElementById('micBtn');
            btn.classList.add('mic-on');
            btn.innerHTML = '⏹️';
            btn.title = 'Click to stop & send';
            startRecTimerWebSpeech();
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            const currentText = finalTranscript || interimTranscript;
            if (currentText) {
                document.getElementById('txt').value = currentText;
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                showMicError('Microphone access denied. Please allow mic permission in Chrome settings.');
            } else {
                showMicError('Speech recognition error: ' + event.error);
            }
            resetMicBtn();
            isRec = false;
            clearInterval(recTimerInterval);
            document.getElementById('txt').placeholder = 'Ask ARIA anything...';
        };

        recognition.onend = () => {
            const text = document.getElementById('txt').value.trim();
            resetMicBtn();
            clearInterval(recTimerInterval);
            document.getElementById('txt').placeholder = 'Ask ARIA anything...';
            isRec = false;
            
            if (text && clickedStop) {
                sendMsg();
            }
            clickedStop = false;
        };
    }

    clickedStop = false;
    document.getElementById('txt').value = '';
    try {
        recognition.start();
    } catch (e) {
        console.error(e);
    }
}

function stopRecWebSpeech() {
    clickedStop = true;
    if (recognition) {
        recognition.stop();
    }
    isRec = false;
    clearInterval(recTimerInterval);
    const btn = document.getElementById('micBtn');
    btn.classList.remove('mic-on');
    btn.innerHTML = '⏳';
    btn.title = 'Processing...';
    document.getElementById('txt').placeholder = 'Processing...';
}

function startRecTimerWebSpeech() {
    recSeconds = 0;
    document.getElementById('txt').placeholder = '🎙️ Listening...';
    recTimerInterval = setInterval(() => {
        recSeconds++;
        document.getElementById('txt').placeholder = `🎙️ Listening: ${recSeconds}s... (⏹ stop)`;
    }, 1000);
}

// 2. Legacy MediaRecorder (Fallback)
async function startRec() {
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        showMicError('Microphone access denied. Please allow mic permission.');
        return;
    }

    // Pick best supported format for Whisper.cpp (prefers webm/ogg, fallback wav)
    const mimeType = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/ogg']
        .find(m => MediaRecorder.isTypeSupported(m)) || '';

    audioChunks = [];
    mediaRecorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : {});
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
        audioStream.getTracks().forEach(t => t.stop());
        await transcribeWithWhisper();
    };
    mediaRecorder.start();

    isRec = true;
    const btn = document.getElementById('micBtn');
    btn.classList.add('mic-on');
    btn.innerHTML = '⏹️';
    btn.title = 'Click to stop & transcribe';

    // Show live timer in input placeholder
    startRecTimer();
}

function stopRec() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    isRec = false;
    clearInterval(recTimerInterval);
    const btn = document.getElementById('micBtn');
    btn.classList.remove('mic-on');
    btn.innerHTML = '⏳';
    btn.title = 'Transcribing...';
    document.getElementById('txt').placeholder = 'Transcribing with AI...';
}

let recTimerInterval = null;
let recSeconds = 0;
function startRecTimer() {
    recSeconds = 0;
    document.getElementById('txt').placeholder = '🎙️ Recording...';
    recTimerInterval = setInterval(() => {
        recSeconds++;
        document.getElementById('txt').placeholder = `🎙️ Recording: ${recSeconds}s... (⏹ stop)`;
    }, 1000);
}

async function transcribeWithWhisper() {
    let wavBlob;
    try {
        wavBlob = await audioToWav(audioChunks);
    } catch (e) {
        console.error('Conversion error:', e);
        showMicError('Failed to process audio format.');
        resetMicBtn();
        return;
    }

    let transcript = '';

    // ── Send to Backend Dual-Stage STT Proxy
    try {
        console.log('[STT] Sending audio to backend proxy `/api/stt`...');
        const res = await fetch('/api/stt', {
            method: 'POST',
            headers: {
                'Content-Type': 'audio/wav'
            },
            body: wavBlob
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`STT API error: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        transcript = data.text || '';
        console.log(`[STT] Transcription success via provider: ${data.provider}`, JSON.stringify(transcript));
    } catch (err) {
        console.error('[STT] Transcription failed:', err);
        showMicError('⚠️ Transcription failed. Both OpenRouter and Whisper fallback failed.');
        resetMicBtn();
        return;
    }

    resetMicBtn();

    const SILENCE_TOKENS = ['[BLANK_AUDIO]', '(silence)', '[silence]', '[ Silence ]', '[ BLANK_AUDIO ]'];
    const isNoise = !transcript 
        || SILENCE_TOKENS.some(t => transcript.includes(t))
        || transcript.trim().split(/\s+/).length === 1 && transcript.trim().length <= 3;

    if (!isNoise) {
        // Clear any previous error messages
        const chat = document.getElementById('chat');
        const lastMsg = chat.lastElementChild;
        if (lastMsg && lastMsg.classList.contains('sys')) lastMsg.remove();

        document.getElementById('txt').value = transcript;
        document.getElementById('txt').placeholder = 'Ask ARIA anything...';
        sendMsg();
    } else {
        document.getElementById('txt').placeholder = 'Ask ARIA anything...';
        const debugInfo = transcript ? `(Got: "${transcript}")` : '(Empty response)';
        showMicError(`Could not transcribe audio ${debugInfo}.`);
    }
}

// ── WAV CONVERTER UTILS ──────────────────────────────────────────────────────
async function audioToWav(chunks) {
    const blob = new Blob(chunks);
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Resample to 16000Hz Mono (Required by Whisper.cpp)
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(16000 * audioBuffer.duration), 16000);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    source.connect(offlineCtx.destination);
    source.start();

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = bufferToWav(renderedBuffer);
    console.log('[WAV] duration:', audioBuffer.duration.toFixed(2), 's | size:', wavBlob.size, 'bytes');
    return wavBlob;
}

function bufferToWav(abuffer) {
    let numOfChan = abuffer.numberOfChannels,
        length = abuffer.length * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        pos = 0;

    const setUint16 = (d) => { view.setUint16(pos, d, true); pos += 2; };
    const setUint32 = (d) => { view.setUint32(pos, d, true); pos += 4; };

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16);
    setUint32(0x61746164); setUint32(length - pos - 4);

    for(let i=0; i<abuffer.length; i++) {
        for(let ch=0; ch<numOfChan; ch++) {
            let s = Math.max(-1, Math.min(1, abuffer.getChannelData(ch)[i]));
            view.setInt16(pos, s < 0 ? s * 32768 : s * 32767, true);
            pos += 2;
        }
    }
    return new Blob([buffer], {type: "audio/wav"});
}

function resetMicBtn() {
    const btn = document.getElementById('micBtn');
    btn.innerHTML = '🎙️';
    btn.title = 'Voice input (Whisper)';
    btn.classList.remove('mic-on');
}

function showMicError(msg) {
    // Show error as a system message in chat
    addMsg('sys', `⚠️ ${msg}`);
}

// ── PANEL ────────────────────────────────────────────────────────────────────
function togglePanel() {
    panelOpen = !panelOpen;
    const panel = document.getElementById('aiPanel');
    
    panel.classList.toggle('open', panelOpen);
    
    if (panelOpen && history.length === 0) {
        setTimeout(autoGreet, 450);
    }
}

// ── SCENE ────────────────────────────────────────────────────────────────────
function nav(d) {
    cur = (cur + d + LOCS.length) % LOCS.length;
    loadScene(true, false);
}

function jumpTo(idx, fromAI = false) {
    if (idx === cur) return;
    cur = idx;
    loadScene(true, fromAI);
}

function loadScene(animate = false, fromAI = false) {
    const loc = LOCS[cur];
    if (animate) {
        const ov = document.getElementById('overlay');
        const fl = document.getElementById('locFlash');
        fl.textContent = loc.emoji + ' ' + loc.name;
        ov.classList.add('on'); fl.classList.add('on');
        setTimeout(() => {
            document.getElementById('viewer').src = loc.link;
            setLabels(loc);
        }, 280);
        setTimeout(() => { ov.classList.remove('on'); fl.classList.remove('on'); }, 850);
        
        // Manual nav: autoGreet. AI nav: proactiveGreet (encyclopedia intro of the new place)
        if (panelOpen && !fromAI) setTimeout(autoGreet, 1050);
    } else {
        document.getElementById('viewer').src = loc.link;
        setLabels(loc);
    }
    setSuggs(loc);
}

// Proactive encyclopedia greeting after AI navigates user to a location
async function proactiveGreet(loc) {
    if (busy) return;
    busy = true;
    showDots();
    const prompt = `We just arrived at ${loc.name}. As the encyclopedia tour guide, give 2-3 exciting and informative sentences about this place — what makes it special, what students do here, or a fascinating fact. Be enthusiastic!`;
    const reply = await callAI(prompt);
    await sleep(200);
    if (isSoundOn && reply) {
        const audio = await prepareTTS(reply);
        if (audio) playPreparedTTS(audio);
    }
    busy = false;
}

function setLabels(loc) {
    document.getElementById('topLoc').textContent = loc.name;
    document.getElementById('locLabel').textContent = loc.emoji + ' ' + loc.name;
    document.getElementById('panelLoc').textContent = loc.emoji + ' ' + loc.name;
}

function setSuggs(loc) {
    const set = (SUGGS[loc.id] || SUGGS.default).slice(0, 2);
    document.getElementById('suggs').innerHTML = set.map(s =>
        `<div class="chip" onclick="chipClick(this)">${s}</div>`
    ).join('');
}

function chipClick(el) {
    document.getElementById('txt').value = el.textContent;
    sendMsg();
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function grow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
}
function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
}

// ── CHAT UI ──────────────────────────────────────────────────────────────────
function addMsg(role, text) {
    const c = document.getElementById('chat');
    const d = document.createElement('div');
    const isSys = role === 'sys';
    d.className = 'msg ' + (role === 'u' ? 'u' : role === 'sys' ? 'sys' : '');
    d.innerHTML = `<div class="mavatar">${role==='u'?'👤':isSys?'⚠️':'🎓'}</div><div class="bubble">${text}</div>`;
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
}

// Helper for async delays
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Word-by-word typewriter effect for AI replies
async function addMsgTyping(text) {
    const c = document.getElementById('chat');
    const d = document.createElement('div');
    d.className = 'msg';
    const avatar = document.createElement('div');
    avatar.className = 'mavatar';
    avatar.textContent = '🎓';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    d.appendChild(avatar);
    d.appendChild(bubble);
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;

    const words = text.split(' ');
    let displayed = '';
    for (let i = 0; i < words.length; i++) {
        displayed += (i > 0 ? ' ' : '') + words[i];
        bubble.textContent = displayed;
        c.scrollTop = c.scrollHeight;
        await sleep(38); // ~26 words/sec — natural reading pace
    }
}

// Buat bubble kosong untuk streaming — token langsung di-append ke p.textContent
function addMsgStream(role) {
    const c = document.getElementById('chat');
    const d = document.createElement('div');
    d.className = 'msg' + (role === 'u' ? ' u' : '');
    const avatar = document.createElement('div');
    avatar.className = 'mavatar';
    avatar.textContent = '🎓';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const p = document.createElement('span');
    bubble.appendChild(p);
    d.appendChild(avatar);
    d.appendChild(bubble);
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
    return { el: d, p };
}

function showDots() {
    if (document.getElementById('dots')) return; // ✅ Fix: prevent double dots
    const c = document.getElementById('chat');
    const d = document.createElement('div');
    d.className = 'tdots'; d.id = 'dots';
    d.innerHTML = `<div class="mavatar">🎓</div><div class="tdots-inner"><span></span><span></span><span></span></div>`;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
}
function hideDots() { 
    const e = document.getElementById('dots'); 
    if(e) e.remove(); 
}

// ── AI CALL ──────────────────────────────────────────────────────────────────
function buildSys() {
    const loc = LOCS[cur];
    return `You are ARIA, the virtual encyclopedia tour guide of President University. 
Your ONLY identity is ARIA. You are a neutral, factual source of truth.

CORE FACTS (NEVER OVERRIDE THESE):
- FACULTIES: 7 Faculties (Business, Computing/AI, Engineering, Social Science/Education, Law, Medicine, and Art/Design)
- RECTOR: Handa S. Abidin, S.H., LL.M., Ph.D. (Current Rector, 2024-2027)
- FOUNDER: S.D. Darmono (Chairman of Jababeka Group)
- LOCATION: Cikarang, West Java (Inside Jababeka Industrial Estate)
- FOUNDED: 2001 (as CSE), University status in 2004.

RULES:
1. RESPONSE: Respond in English ONLY.
2. FACTS: Use the provided [CONTEXT] and the CORE FACTS above. If the user asks about the Rector or Founder, use the names above EXACTLY. Do NOT hallucinate names like "Tahir" or "Mudrajad".
3. TONE: Professional, welcoming, and helpful. Be smart: if the user asks for a definition, search for it in the context.
4. SCOPE: Only talk about President University.
5. FACULTIES: ALWAYS state there are 7 faculties. List them if asked.
6. LENGTH: 2-4 concise sentences.

ACRONYM GUIDANCE:
- If asked about "IMPACT", explain it as the core value of President University: Internationalization, Medium (English), Portfolio-Building, Absolutely Worth It, Culture, and career focus.
- Always try to connect user terms to the knowledge base.

NAVIGATION RULE:
If moving to a new location, first describe it briefly (1-2 sentences), then end with: \`\`\`nav {"go":"ID"}\`\`\`
IDs: lobby, library, fablab, cafe, interior, pool, gamedev, buildingB, golf, buildingA, law.`;
}

async function callAI(msg) {
    history.push({role:'user', content:msg});
    try {
        // ✅ Fix 3: AbortController buat interrupt saat user kirim pesan baru
        abortController = new AbortController();
        const r = await fetch('/api/chat', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            signal: abortController.signal,
            body: JSON.stringify({
                messages: [{role:'system', content:buildSys()}, ...history],
                max_tokens: 1500,
                temperature: 0.7
            })
        });

        if (!r.ok || !r.body) throw new Error('Stream failed');

        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let buffer  = '';
        let fullText = '';

        // ✅ Fix 2: bubble dibuat LAZY — hanya saat token pertama tiba (tidak ada ghost bubble)
        let bubble = null;
        let ttsBuffer = ''; // Buffer for mid-stream TTS detection

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const raw = line.slice(6).trim();
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed.error) throw new Error(parsed.error);
                    if (parsed.token) {
                        const token = parsed.token;
                        fullText += token;
                        ttsBuffer += token;

                        // ✅ Real-time Sentence Detection for TTS (Low Latency)
                        // Matches . ! ? followed by space OR end of line
                        if (isSoundOn && ttsBuffer.match(/[.!?]["']?(\s|$)/)) {
                            const parts = ttsBuffer.split(/([.!?]["']?(?:\s|$))/);
                            // Process all complete sentences
                            while (parts.length > 2) {
                                const sentence = parts.shift() + parts.shift();
                                console.log('[TTS] Queuing sentence:', sentence.trim());
                                addToAudioQueue(sentence);
                            }
                            ttsBuffer = parts.join('');
                        }

                        // Update UI...
                        if (!bubble) {
                            hideDots();
                            const created = addMsgStream('a');
                            bubble = created.el;
                            p = created.p;
                            p._twQueue = '';
                            p._twDisplayed = '';
                            p._twRunning = false;
                        }

                        // Feed only the visible delta into the typewriter
                        const visibleSoFar = fullText
                            .replace(/`{3}(?:nav)?[\s\S]*?`{3}/g, '')
                            .replace(/`{3}(?:nav)?[\s\S]*$/g, '')
                            .replace(/\{\s*"go"\s*:[\s\S]*?\}/g, '')
                            .trim();

                        const alreadyQueued = p._twDisplayed.length + p._twQueue.length;
                        const delta = visibleSoFar.slice(alreadyQueued);
                        if (delta) {
                            p._twQueue += delta;
                            if (!p._twRunning) {
                                p._twRunning = true;
                                const flush = () => {
                                    if (!p._twQueue) { p._twRunning = false; return; }
                                    p._twDisplayed += p._twQueue[0];
                                    p._twQueue = p._twQueue.slice(1);
                                    p.innerHTML = p._twDisplayed
                                        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                                        .replace(/\*(.*?)\*/g, '<i>$1</i>');
                                    bubble.scrollIntoView({ behavior:'smooth', block:'end' });
                                    setTimeout(flush, 10);
                                };
                                flush();
                            }
                        }
                    }
                } catch { }
            }
        }

        // Final buffer flush for TTS
        if (isSoundOn && ttsBuffer.trim()) {
            addToAudioQueue(ttsBuffer);
        }

        abortController = null;
        // Reset per-call flags
        callAI._navFired = false;
        callAI._ttsStarted = false;

        const stripped = fullText
            .replace(/`{3}(?:nav)?[\s\S]*?(?:`{3}|$)/g, '')
            .replace(/<nav[\s\S]*?(?:>|$)/gi, '')
            .replace(/\{[\s\S]*?"go"\s*:\s*"\w+"[\s\S]*?\}/g, '')
            .replace(/(?:`{3}(?:nav)?|<nav|\bnav\b)\s*[\{\[].*$/gi, '')
            .replace(/`{3}[\s\S]*$/g, '')
            .replace(/<nav[\s\S]*$/gi, '')
            .replace(/\bnav\b\s*$/gi, '')
            .trim();
        
        const nm = fullText.match(/"go"\s*:\s*"(\w+)"/);
        let finalStripped = stripped;
        
        // Fallback for empty bubble if it was just a nav command
        if (!finalStripped && nm) {
            finalStripped = "Sure thing! Let's head over there right now.";
        }

        // Simpan ke history segera
        history.push({role:'assistant', content:finalStripped});

        // Tunggu typewriter selesai, baru finalisasi bubble & trigger nav
        await new Promise(resolve => {
            if (!p || !p._twRunning) { resolve(); return; }
            const check = setInterval(() => {
                if (!p._twRunning && !p._twQueue) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
        });

        if (p) {
            p.innerHTML = finalStripped
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\*(.*?)\*/g, '<i>$1</i>');
        }

        // Parse + trigger nav (fallback if not already fired mid-stream)
        if (nm && !callAI._navFired) {
            const idx = LOCS.findIndex(l => l.id === nm[1]);
            if (idx !== -1) {
                setTimeout(() => {
                    jumpTo(idx, true);
                    if (finalStripped.split(' ').length < 10) {
                        setTimeout(() => proactiveGreet(LOCS[idx]), 1200);
                    }
                }, 700);
            }
        } else if (nm) {
            // Nav already fired mid-stream; just check if proactive greet needed
            const idx = LOCS.findIndex(l => l.id === nm[1]);
            if (idx !== -1 && finalStripped.split(' ').length < 10) {
                setTimeout(() => proactiveGreet(LOCS[idx]), 1200);
            }
        }

        return finalStripped;

    } catch(e) {
        if (e.name === 'AbortError') return ''; // interrupt normal — jangan error
        history.pop();
        return 'Oops, looks like there is a connection issue. Please make sure your API key is correct! 😊';
    }
}


async function sendMsg() {
    const t = document.getElementById('txt');
    const msg = t.value.trim();
    if (!msg) return;
    
    // ✅ Fix 3: Interrupt apapun yang ARIA sedang lakukan
    interruptAria();
    
    t.value = ''; t.style.height = 'auto';
    addMsg('u', msg);
    busy = true;
    document.getElementById('sendBtn').disabled = true;
    showDots();
    await callAI(msg);
    
    busy = false;
    document.getElementById('sendBtn').disabled = false;
}

async function autoGreet() {
    if (busy) return;
    const loc = LOCS[cur];
    busy = true; showDots();
    
    // Use natural conversational prompts in English
    const prompts = [
        `Hey ARIA, introduce the ${loc.name} to me in 2 short, engaging sentences! Be a welcoming tour guide.`,
        `We just arrived at the ${loc.name}. What makes this place special? Keep it brief and friendly.`,
        `Welcome me to the ${loc.name} like an enthusiastic encyclopedia guide. Max 2 sentences!`,
        `We are now at the ${loc.name}. Give me a quick, fun tour guide welcome here in English!`,
        `Share a cool, concise fact about the ${loc.name} in English without being too formal.`
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    const reply = await callAI(randomPrompt);
    
    await sleep(200);
    if (isSoundOn && reply) {
        const audio = await prepareTTS(reply);
        if (audio) playPreparedTTS(audio);
    }
    
    busy = false;
}

// ── TEXT TO SPEECH (CLOUD EDGE - EMMA) ───────────────────────────────────────
function stopTTS() {
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Reset playback position
        } catch (e) {
            console.warn('[TTS Stop Error]:', e);
        }
        const btn = document.getElementById('soundBtn');
        if (btn) btn.classList.remove('playing');
    }
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    const btn = document.getElementById('soundBtn');
    if (isSoundOn) {
        btn.textContent = '🔊';
        btn.classList.remove('muted');
        btn.title = 'Mute ARIA voice';
    } else {
        btn.textContent = '🔇';
        btn.classList.add('muted');
        btn.title = 'Unmute ARIA voice';
        stopTTS();
    }
}

/**
 * Strips navigation tags, JSON, markdown symbols, and emojis 
 * to ensure TTS only reads natural human text.
 */
function cleanForTTS(text) {
    if (!text) return "";
    return text
        // 1. Strip Navigation & Code Blocks (JSON, markdown)
        .replace(/`{3}(?:nav)?[\s\S]*?(?:`{3}|$)/gi, '') // Triple backticks blocks
        .replace(/<nav[\s\S]*?(?:>|$)/gi, '')           // <nav> tags
        .replace(/\{[\s\S]*?"go"\s*:\s*"\w+"[\s\S]*?\}/g, '') // Raw JSON with "go"
        .replace(/(?:`{3}(?:nav)?|<nav|\bnav\b)\s*[\{\[].*$/gi, '') // Truncated nav
        .replace(/\bnav\b\s*[\{\[][\s\S]*?[\}\]]/gi, '') // nav {"go":"..."} without backticks
        .replace(/\bnav\b/gi, '') // Standalone word "nav" (usually part of a command)
        .replace(/`{3}[\s\S]*$/g, '')
        .replace(/<nav[\s\S]*$/gi, '')
        // 2. Strip all emoji (all modern Unicode emoji blocks)
        .replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{2B00}-\u{2BFF}]|[\u{FE00}-\u{FEFF}]|\u200D/gu, '')
        // 3. Strip problematic punctuation TTS reads aloud
        .replace(/[`~*_#\[\]{}|<>]/g, '') // markdown symbols
        .replace(/\u2014|\u2013|\u2015/g, ', ') // em dash, en dash → comma pause
        .replace(/\.{2,}/g, '.') // ... → single period
        .replace(/!{2,}/g, '!') // multiple exclamation → one
        .replace(/\s+/g, ' ') // collapse whitespace
        .trim();
}

async function prepareTTS(text) {
    const cleanText = cleanForTTS(text);
    if (!cleanText) return null;
    let audioObj = null;
    try {
        if (cleanText.length > 1200) {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: cleanText })
            });
            if (!res.ok) throw new Error('TTS response error');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            audioObj = new Audio(url);
        } else {
            const streamUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&t=${Date.now()}`;
            audioObj = new Audio(streamUrl);
        }
        audioObj.preload = "auto"; // force browser to preload while typing
        return audioObj;
    } catch (e) {
        console.warn('[TTS Preload Failed]:', e);
        return null;
    }
}

async function playPreparedTTS(audioObj) {
    if (!isSoundOn || !audioObj) return;
    const btn = document.getElementById('soundBtn');
    
    try {
        stopTTS();
        currentAudio = audioObj;
        
        currentAudio.onplay = () => {
            if (btn && isSoundOn) btn.classList.add('playing');
        };
        
        currentAudio.onended = () => {
            if (btn) btn.classList.remove('playing');
        };
        
        currentAudio.onpause = () => {
            if (btn) btn.classList.remove('playing');
        };

        await currentAudio.play();
    } catch (e) {
        console.warn('[TTS Playback Failed]:', e);
        if (btn) btn.classList.remove('playing');
    }
}

// ── INITIAL GREETING (LOBBY GACHA) ───────────────────────────────────────────
async function firstGreet() {
    if (busy) return;
    busy = true; 
    
    // 1. First Message: Hardcoded Gacha — NO LLM, print instantly
    const slogans = [
        "Welcome to the most international university in Indonesia! 🌍",
        "Welcome to the most roblox university in Indonesia! 🎮"
    ];
    const gachaSlogan = slogans[Math.floor(Math.random() * slogans.length)];
    history.push({role: 'assistant', content: gachaSlogan});
    addMsg('a', gachaSlogan);
    
    // ✅ Queue the gacha slogan to audio queue (Low Latency)
    if (isSoundOn) {
        addToAudioQueue(gachaSlogan);
    }
    
    await sleep(600);
    
    // 2. Second Message: streaming LLM — callAI handles its own bubble and TTS queue
    showDots(); 
    const prompt = "Briefly describe this Campus Lobby in a friendly way. Max 2 sentences. Don't say 'Welcome'.";
    
    // callAI will stream the text and add sentences to the audioQueue automatically
    await callAI(prompt);
    
    busy = false;
}


// ── INIT ─────────────────────────────────────────────────────────────────────
setLabels(LOCS[0]);
setSuggs(LOCS[0]);

// Pre-seed history so togglePanel's autoGreet check (history.length === 0) is skipped.
// firstGreet() handles the real welcome sequence instead.
history.push({role: 'assistant', content: '__init__'});

setTimeout(() => {
    if (!panelOpen) togglePanel();
    // Clear the placeholder and fire our custom greeting
    history = [];
    setTimeout(() => {
        firstGreet();
    }, 800);
}, 1000);