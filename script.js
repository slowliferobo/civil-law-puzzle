const CONFIG = {
    DEBUG_MODE: false, // Set to false for release
    GAME: {
        INITIAL_TIME: 60,
        LEVEL_COUNT: 3,
        LEVEL_SETTINGS: [
            { pairs: 3, timeBonus: 30 },
            { pairs: 5, timeBonus: 45 },
            { pairs: 8, timeBonus: 60 }
        ],
        PENALTY_TIME: 5,   // Risk: -5 seconds for wrong match
        REWARD_TIME: 3,    // Return: +3 seconds for correct match
        SCORE_MATCH: 100,
        COMBO_WINDOW: 3000, // ms
        COMBO_MULTIPLIER: [1.0, 1.2, 1.5, 2.0] // x1, x1.2, x1.5, x2.0
    },
    UI: {
        ERROR_SHAKE_DURATION: 400,
        MATCH_DELAY: 500
    }
};

// --- Audio System (Web Audio API) ---
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

const SOUNDS = {
    BGM: null, // Placeholder
    SE_SELECT: { type: 'sine', freq: 880, duration: 0.1 },
    SE_MATCH: { type: 'sine', freq: [1100, 1760], duration: 0.2 }, // High pitch
    SE_ERROR: { type: 'sawtooth', freq: 150, duration: 0.3 }, // Low buzz
    SE_CLEAR: { type: 'square', freq: [523, 659, 783, 1046], duration: 0.5 } // Fanfare
};

function playSound(name) {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const sound = SOUNDS[name];
    if (!sound) return;

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = sound.type;

        // Simple frequency handling
        if (Array.isArray(sound.freq)) {
            osc.frequency.setValueAtTime(sound.freq[0], audioCtx.currentTime);
            sound.freq.forEach((f, i) => {
                if (i > 0) osc.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.1);
            });
        } else {
            osc.frequency.setValueAtTime(sound.freq, audioCtx.currentTime);
        }

        // Use linear ramp for better compatibility
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01); // Attack
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + sound.duration); // Decay

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + sound.duration);
    } catch (e) {
        console.error("Audio playback failed:", e);
    }
}

// Unlock AudioContext on first user interaction
function unlockAudio() {
    initAudio();
    // Try to play a silent buffer to force the audio engine to wake up
    try {
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
        console.log("Audio warmed up");
    } catch (e) {
        console.error("Audio warmup failed", e);
    }

    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
}
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);
document.addEventListener('keydown', unlockAudio);

const termsData = [
    { id: 1, term: "善意", definition: "ある事情を知らないこと" },
    { id: 2, term: "悪意", definition: "ある事情を知っていること" },
    { id: 3, term: "心裡留保", definition: "真意でないことを知りながら意思表示すること" },
    { id: 4, term: "虚偽表示", definition: "相手方と通じて真意でない意思表示をすること" },
    { id: 5, term: "錯誤", definition: "意思表示に対応する意思を欠くこと" },
    { id: 6, term: "詐欺", definition: "他人を欺いて錯誤に陥れること" },
    { id: 7, term: "強迫", definition: "他人を脅迫して畏怖させること" },
    { id: 8, term: "権利能力", definition: "権利・義務の主体となりうる資格" },
    { id: 9, term: "意思能力", definition: "自分の行為の結果を弁識する能力" },
    { id: 10, term: "行為能力", definition: "単独で確定的に有効な法律行為をする能力" },
    { id: 11, term: "催告", definition: "相手方に対して一定の行為を要求すること" },
    { id: 12, term: "取消し", definition: "一応有効な法律行為を遡及的に無効にすること" },
    { id: 13, term: "追認", definition: "不確定な法律行為を確定的に有効にすること" },
    { id: 14, term: "時効", definition: "事実状態が一定期間継続した場合に権利の取得・消滅を認める制度" },
    { id: 15, term: "物権", definition: "物を直接に支配する権利" },
    { id: 16, term: "債権", definition: "特定の人に対して特定の行為を請求する権利" },
    { id: 17, term: "同時履行の抗弁権", definition: "相手方が履行するまで自分の債務の履行を拒む権利" },
    { id: 18, term: "危険負担", definition: "不可抗力で債務が履行不能になった場合の損失負担の問題" },
    { id: 19, term: "弁済", definition: "債務者が債務の給付を行い債権を消滅させること" },
    { id: 20, term: "相殺", definition: "対立する同種の債権を対当額で消滅させること" }
];

const gameContainer = document.getElementById('game-container');
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const playArea = document.getElementById('play-area');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const finalScoreDisplay = document.getElementById('final-score');

let score = 0;
let timeLeft = CONFIG.GAME.INITIAL_TIME;
let timerInterval;
let activeBlocks = [];
let currentLevel = 1;
let maxLevels = CONFIG.GAME.LEVEL_COUNT;
let lastMatchTime = 0;
let comboCount = 0;
let isInvincible = false; // Debug feature

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('retry-btn').addEventListener('click', startGame);
const ignoreBtn = document.getElementById('ignore-rotate-btn');
if (ignoreBtn) {
    ignoreBtn.addEventListener('click', () => {
        document.getElementById('rotate-message').style.display = 'none';
    });
}

// --- Debug Features ---
document.addEventListener('keydown', (e) => {
    if (!CONFIG.DEBUG_MODE) return;

    switch (e.key.toLowerCase()) {
        case 't': // Time manipulation
            timeLeft += 10;
            updateTimerDisplay();
            console.log("Debug: +10s");
            break;
        case 'w': // Warp / Win
            levelClear();
            console.log("Debug: Instant Level Clear");
            break;
        case 'i': // Invincibility
            isInvincible = !isInvincible;
            console.log(`Debug: Invincibility ${isInvincible ? 'ON' : 'OFF'}`);
            document.getElementById('hud').style.color = isInvincible ? 'red' : 'black';
            break;
    }
});

function startGame() {
    // Ensure audio context is resumed on user gesture
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Play start sound for feedback
    playSound('SE_SELECT');

    score = 0;
    currentLevel = 1;
    startLevel();

    // Track game start
    if (typeof gtag === 'function') {
        gtag('event', 'game_start');
    }
}

function startLevel() {
    // Level settings from CONFIG
    const settings = CONFIG.GAME.LEVEL_SETTINGS[currentLevel - 1] || CONFIG.GAME.LEVEL_SETTINGS[CONFIG.GAME.LEVEL_SETTINGS.length - 1];
    let pairsCount = settings.pairs;
    let timeBonus = settings.timeBonus;

    timeLeft = timeBonus;
    scoreDisplay.textContent = score;
    updateTimerDisplay();

    showScreen(gameScreen);

    // Ensure layout is ready before generating blocks
    // Double requestAnimationFrame ensures we are in the next paint frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            generateBlocks(pairsCount);
        });
    });

    // Track level start
    if (typeof gtag === 'function') {
        gtag('event', 'level_start', {
            'level_name': currentLevel
        });
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function updateTimer() {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(timerInterval);
    finalScoreDisplay.textContent = score;
    showScreen(resultScreen);

    // Track game completion
    if (typeof gtag === 'function') {
        gtag('event', 'game_complete', {
            'score': score,
            'level_reached': currentLevel
        });
    }
}

function generateBlocks(count) {
    playArea.innerHTML = '';
    activeBlocks = [];

    // Pick random terms for the round
    const shuffledTerms = [...termsData].sort(() => 0.5 - Math.random()).slice(0, count);

    shuffledTerms.forEach(item => {
        createBlock(item.term, 'term', item.id);
        createBlock(item.definition, 'def', item.id);
    });
}

let selectedBlock = null;

function createBlock(text, type, id) {
    const block = document.createElement('div');
    block.classList.add('block', type);
    block.textContent = text;
    block.dataset.id = id;
    block.dataset.type = type;

    // Append first to get dimensions
    playArea.appendChild(block);
    activeBlocks.push(block);

    // Random position with better distribution
    const padding = 20; // Reduced padding
    const headerHeight = 60; // Reduced header height assumption

    // Get dimensions with fallback
    let blockWidth = block.offsetWidth;
    let blockHeight = block.offsetHeight;

    // If dimensions are 0 (layout failed), force default size
    if (blockWidth === 0 || blockHeight === 0) {
        blockWidth = 150;
        blockHeight = 60;
        block.style.width = `${blockWidth}px`;
        block.style.height = `${blockHeight}px`;
    }

    // Ensure we have valid ranges even on small screens
    const maxX = Math.max(padding, window.innerWidth - blockWidth - padding);
    const maxY = Math.max(headerHeight + padding, window.innerHeight - blockHeight - padding);
    const minY = headerHeight + padding;

    // If screen is too small, maxY might be less than minY. Handle this.
    const safeMaxY = Math.max(minY, maxY);

    let x, y;
    let overlap = false;
    let attempts = 0;
    const maxAttempts = 50;

    do {
        overlap = false;
        x = Math.random() * (maxX - padding) + padding;
        y = Math.random() * (safeMaxY - minY) + minY;

        // Check collision with existing active blocks
        const newRect = {
            left: x,
            right: x + blockWidth,
            top: y,
            bottom: y + blockHeight
        };

        for (const otherBlock of activeBlocks) {
            if (otherBlock === block) continue; // Skip self

            const otherRect = otherBlock.getBoundingClientRect();
            // If otherBlock has 0 dims, use fallback for it too (approximation)
            const otherW = otherRect.width || 150;
            const otherH = otherRect.height || 60;

            // Add some margin to the check to ensure they are not touching
            const margin = 10;
            const expandedOtherRect = {
                left: (otherRect.left || 0) - margin,
                right: (otherRect.left || 0) + otherW + margin,
                top: (otherRect.top || 0) - margin,
                bottom: (otherRect.top || 0) + otherH + margin
            };

            if (isOverlapping(newRect, expandedOtherRect)) {
                overlap = true;
                break;
            }
        }
        attempts++;
    } while (overlap && attempts < maxAttempts);

    block.style.left = `${x}px`;
    block.style.top = `${y}px`;

    makeDraggable(block);

    // Click to match logic
    block.addEventListener('click', (e) => {
        // Prevent click if it was a drag
        if (block.dataset.isDragging === 'true') return;
        playSound('SE_SELECT');
        handleBlockClick(block);
    });
}

function handleBlockClick(block) {
    if (block.classList.contains('matched')) return;

    if (!selectedBlock) {
        // Select first block
        selectedBlock = block;
        block.classList.add('selected');
    } else if (selectedBlock === block) {
        // Deselect if clicked again
        selectedBlock.classList.remove('selected');
        selectedBlock = null;
    } else {
        // Second block clicked
        const firstBlock = selectedBlock;

        // Check if they are same type (e.g. both terms) -> Switch selection
        if (firstBlock.dataset.type === block.dataset.type) {
            firstBlock.classList.remove('selected');
            selectedBlock = block;
            block.classList.add('selected');
            return;
        }

        // Check match
        if (firstBlock.dataset.id === block.dataset.id) {
            handleMatch(firstBlock, block);
            selectedBlock = null;
        } else {
            // Wrong match
            handleMismatch(firstBlock, block);
            selectedBlock = null;
        }
    }
}

function handleMismatch(block1, block2) {
    playSound('SE_ERROR');

    // Risk: Penalty
    if (!isInvincible) {
        timeLeft -= CONFIG.GAME.PENALTY_TIME;
        updateTimerDisplay();
        triggerVisualPenalty();
    }

    block1.classList.add('error');
    block2.classList.add('error');
    setTimeout(() => {
        block1.classList.remove('error');
        block2.classList.remove('error');
        block1.classList.remove('selected');
        block2.classList.remove('selected');
    }, CONFIG.UI.ERROR_SHAKE_DURATION);
}

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let hasMoved = false;

    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        isDragging = true;
        hasMoved = false;
        element.dataset.isDragging = 'false';

        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

        startX = clientX;
        startY = clientY;

        const rect = element.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // Move to front
        element.style.zIndex = 100;

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
        if (!isDragging) return;

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        // Threshold to consider it a drag vs click
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasMoved = true;
            element.dataset.isDragging = 'true';
            e.preventDefault(); // Prevent scrolling only if actually dragging
        }

        if (hasMoved) {
            element.style.left = `${initialLeft + dx}px`;
            element.style.top = `${initialTop + dy}px`;
        }
    }

    function stopDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        element.style.zIndex = '';

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);

        if (hasMoved) {
            checkCollision(element);
        }
    }
}

function checkCollision(draggedBlock) {
    const draggedRect = draggedBlock.getBoundingClientRect();
    const draggedId = draggedBlock.dataset.id;
    const draggedType = draggedBlock.dataset.type;

    const targetType = draggedType === 'term' ? 'def' : 'term';

    const targets = document.querySelectorAll(`.block.${targetType}`);

    let matched = false;
    let wrongTarget = null;

    targets.forEach(target => {
        if (matched) return;

        const targetRect = target.getBoundingClientRect();

        if (isOverlapping(draggedRect, targetRect)) {
            if (target.dataset.id === draggedId) {
                // Match!
                handleMatch(draggedBlock, target);
                matched = true;
            } else {
                wrongTarget = target;
            }
        }
    });

    if (!matched && wrongTarget) {
        handleMismatch(draggedBlock, wrongTarget);
    }
}

function isOverlapping(rect1, rect2) {
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

// --- Particle System ---
const canvas = document.getElementById('effects-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.95;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(updateParticles);
}
updateParticles();

// --- Game Logic ---

function handleMatch(block1, block2) {
    playSound('SE_MATCH');

    // Visual Effects: Particles
    const rect1 = block1.getBoundingClientRect();
    const rect2 = block2.getBoundingClientRect();
    createExplosion(rect1.left + rect1.width / 2, rect1.top + rect1.height / 2, '#f5a623'); // Gold
    createExplosion(rect2.left + rect2.width / 2, rect2.top + rect2.height / 2, '#4ecdc4'); // Teal

    // Return: Reward
    timeLeft += CONFIG.GAME.REWARD_TIME;
    updateTimerDisplay();

    // Combo System
    const now = Date.now();
    if (now - lastMatchTime < CONFIG.GAME.COMBO_WINDOW) {
        comboCount++;
    } else {
        comboCount = 0;
    }
    lastMatchTime = now;

    // Calculate Score
    const multiplier = CONFIG.GAME.COMBO_MULTIPLIER[Math.min(comboCount, CONFIG.GAME.COMBO_MULTIPLIER.length - 1)];
    const points = Math.floor(CONFIG.GAME.SCORE_MATCH * multiplier);
    score += points;

    scoreDisplay.textContent = score;

    // Show Combo UI (Simple console log for now, can be improved)
    if (comboCount > 0) {
        console.log(`Combo x${multiplier}!`);
        // TODO: Add visual popup for combo
    }

    block1.classList.add('matched');
    block2.classList.add('matched');

    // Disable interaction
    block1.style.pointerEvents = 'none';
    block2.style.pointerEvents = 'none';

    setTimeout(() => {
        block1.remove();
        block2.remove();

        // Check if all cleared
        if (document.querySelectorAll('.block:not(.matched)').length === 0) {
            levelClear();
        }
    }, CONFIG.UI.MATCH_DELAY);
}

function updateTimerDisplay() {
    timerDisplay.textContent = Math.max(0, timeLeft);
}

function triggerVisualPenalty() {
    console.log("Visual Penalty Triggered");
    gameContainer.classList.remove('shake-screen'); // Reset if already active
    void gameContainer.offsetWidth; // Trigger reflow to restart animation
    gameContainer.classList.add('shake-screen');
    setTimeout(() => {
        gameContainer.classList.remove('shake-screen');
    }, 500);
}

function levelClear() {
    clearInterval(timerInterval);
    if (currentLevel < maxLevels) {
        // Track level clear
        if (typeof gtag === 'function') {
            gtag('event', 'level_clear', {
                'level_name': currentLevel
            });
        }
        playSound('SE_CLEAR');

        // Small delay before next level
        setTimeout(() => {
            currentLevel++;
            startLevel();
        }, 1000);
    } else {
        endGame();
    }
}
