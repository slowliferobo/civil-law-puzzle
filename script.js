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
let timeLeft = 60;
let timerInterval;
let activeBlocks = [];
let currentLevel = 1;
let maxLevels = 3;

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('retry-btn').addEventListener('click', startGame);

function startGame() {
    score = 0;
    currentLevel = 1;
    startLevel();
}

function startLevel() {
    // Level settings
    let pairsCount = 3;
    let timeBonus = 30;

    if (currentLevel === 2) {
        pairsCount = 5;
        timeBonus = 45;
    } else if (currentLevel === 3) {
        pairsCount = 8;
        timeBonus = 60;
    }

    timeLeft = timeBonus;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;

    showScreen(gameScreen);
    generateBlocks(pairsCount);

    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(timerInterval);
    finalScoreDisplay.textContent = score;
    showScreen(resultScreen);
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

    // Ensure we have valid ranges even on small screens
    const maxX = Math.max(padding, window.innerWidth - block.offsetWidth - padding);
    const maxY = Math.max(headerHeight + padding, window.innerHeight - block.offsetHeight - padding);
    const minY = headerHeight + padding;

    // If screen is too small, maxY might be less than minY. Handle this.
    const safeMaxY = Math.max(minY, maxY);

    const x = Math.random() * (maxX - padding) + padding;
    const y = Math.random() * (safeMaxY - minY) + minY;

    block.style.left = `${x}px`;
    block.style.top = `${y}px`;

    makeDraggable(block);

    // Click to match logic
    block.addEventListener('click', (e) => {
        // Prevent click if it was a drag
        if (block.dataset.isDragging === 'true') return;
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
            block.classList.add('error');
            firstBlock.classList.add('error');
            setTimeout(() => {
                block.classList.remove('error');
                firstBlock.classList.remove('error');
                firstBlock.classList.remove('selected');
                selectedBlock = null;
            }, 400);
        }
    }
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

    targets.forEach(target => {
        const targetRect = target.getBoundingClientRect();

        if (isOverlapping(draggedRect, targetRect)) {
            if (target.dataset.id === draggedId) {
                // Match!
                handleMatch(draggedBlock, target);
                matched = true;
            }
        }
    });

    if (!matched) {
        // Optional: Add "wrong" animation or sound here
    }
}

function isOverlapping(rect1, rect2) {
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

function handleMatch(block1, block2) {
    score += 100;
    scoreDisplay.textContent = score;

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
    }, 500);
}

function levelClear() {
    clearInterval(timerInterval);
    if (currentLevel < maxLevels) {
        alert(`Level ${currentLevel} Clear! Next Level...`);
        currentLevel++;
        startLevel();
    } else {
        endGame();
    }
}
