// Part 1: Constants and Variables

// Variables to hold asset paths
const assets = {
    images: [
        'assets/sprites/flapBird01.png',
        'assets/sprites/flapBird02.png',
        'assets/sprites/flapBird03.png',
        'assets/sprites/flapBird04.png',
        'assets/sprites/flapBird05.png',
        'assets/sprites/flapBird06.png',
        'assets/sprites/flapBird07.png',
        'assets/sprites/flapBird08.png'
    ],
    sounds: [
        'assets/sounds/bird_flying.wav',
        'assets/sounds/key2pickup.mp3',
        'assets/sounds/chicken_ranch.mp3',
        'assets/sounds/dead_notification.wav',
        'assets/sounds/winning_game.wav',
        'assets/sounds/impact_-_starninjas/impact.1.ogg',
        'assets/sounds/impact_-_starninjas/impact.2.ogg',
        'assets/sounds/impact_-_starninjas/impact.3.ogg',
        'assets/sounds/impact_-_starninjas/impact.4.ogg',
        'assets/sounds/impact_-_starninjas/impact.5.ogg',
        'assets/sounds/impact_-_starninjas/impact.6.ogg',
        'assets/sounds/impact_-_starninjas/impact.7.ogg',
        'assets/sounds/impact_-_starninjas/impact.8.ogg',
        'assets/sounds/impact_-_starninjas/impact.9.ogg',
        'assets/sounds/impact_-_starninjas/impact.10.ogg'
    ]
};

// Variables to track loaded assets
let loadedAssets = {
    images: 0,
    sounds: 0
};

// Variables for game state
let birdY;
let birdVelocity = 0;
let birdImage = new Image();
let currentFlapBirdImageIndex = 0;
let pipes = [];
let frameCount = 0;
let countdownValue = 3;
let showCountdown = false;
let gameStarted = false;
let gameOver = false;
let playerWon = false;
let flashCounter = 0;
let BIRD_RADIUS;
let PIPE_WIDTH;
let PIPE_GAP;
let PIPE_SPEED = 2;

//Too Fast: Increase PIPE_SPAWN_INTERVAL or decrease PIPE_SPEED.
//Too Slow: Decrease PIPE_SPAWN_INTERVAL or increase PIPE_SPEED.

let PIPE_SPAWN_INTERVAL = 1500;

//Test gameplay: If pipes feel too frequent, try increasing to 2500 milliseconds.
//Test again: If pipes feel too sparse, adjust downwards to 1500 milliseconds.

const gravity = 0.1; 
const jumpForce = -3; 
const LEVEL_THRESHOLD = 5;
const WIN_SCORE = 30;
let score = 0;
let level = 1;
let lastLevelUpScore = 0;
let lastTime = 0; // Initialize lastTime globally
let accumulator = 0; // Initialize accumulator globally
let countdownComplete = false;

// Constants for game configuration
const fixedTimeStep = 16.67; // Approximately 60 FPS

//33.33; // Approximately 30 FPS
//16.67; // Approximately 60 FPS
//13.33; // Approximately 75 FPS
//11.11; // Approximately 90 FPS
//8.33; // Approximately 120 FPS
//6.94; // Approximately 144 FPS

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerWonFlashColor = 'green';
const gameOverFlashColor = 'red';

function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;

    const sizeFactor = Math.min(canvas.width, canvas.height);
    BIRD_RADIUS = sizeFactor / 40;
    birdY = canvas.height / 2;
    PIPE_WIDTH = sizeFactor / 15;
    PIPE_GAP = sizeFactor / 3;

    pipes.forEach(pipePair => {
        const pipeHeight = Math.random() * (canvas.height - PIPE_GAP - 2 * PIPE_WIDTH - 50) + PIPE_WIDTH;
        const capHeight = PIPE_WIDTH / 4;
        Object.assign(pipePair.topPipe, { height: pipeHeight, capHeight });
        Object.assign(pipePair.bottomPipe, { y: pipeHeight + PIPE_GAP, height: canvas.height - pipeHeight - PIPE_GAP, capHeight });
    });

    draw();
    console.log('Resized Canvas method was performed.');
}

// Flap bird images
const flapBirdImages = assets.images.map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

// Part 2: Asset Preloading

// Sound and image assets
const backgroundImage = new Image();
backgroundImage.src = 'assets/backgrounds/bg.png';

const flapSound = new Audio('assets/sounds/bird_flying.wav');
const scoreSound = new Audio('assets/sounds/key2pickup.mp3');
const backgroundMusic = new Audio('assets/sounds/chicken_ranch.mp3');
const loseSound = new Audio('assets/sounds/dead_notification.wav');
const winSound = new Audio('assets/sounds/winning_game.wav');
backgroundMusic.loop = true;

const hitSounds = [
    new Audio('assets/sounds/impact_-_starninjas/impact.1.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.2.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.3.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.4.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.5.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.6.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.7.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.8.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.9.ogg'),
    new Audio('assets/sounds/impact_-_starninjas/impact.10.ogg')
];

[flapSound, scoreSound, backgroundMusic, loseSound, winSound, ...hitSounds].forEach(sound => {
    sound.crossOrigin = 'anonymous';
});

// Function to play a random hit sound
function playRandomHitSound() {
    const randomIndex = Math.floor(Math.random() * hitSounds.length);
    hitSounds[randomIndex].play();
}

// Preload images and sounds
function preloadAssets() {
    assets.images.forEach(src => {
        const img = new Image();
        img.onload = () => {
            loadedAssets.images++;
            checkAllAssetsLoaded();
        };
        img.onerror = () => console.error(Failed to load image: ${src});
        img.src = src;
    });

    assets.sounds.forEach(src => {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            loadedAssets.sounds++;
            checkAllAssetsLoaded();
        };
        audio.onerror = () => console.error('Failed to load sound: ${src}'); //Added quote so that message can print.
        audio.src = src;
        audio.preload = 'auto'; // Trigger loading for audio
    });
}

function checkAllAssetsLoaded() {
    if (loadedAssets.images === assets.images.length && loadedAssets.sounds === assets.sounds.length) {
        console.log('All assets loaded');
        //document.getElementById('startButton').style.display = 'block';
    }
}

// Part 3: Game Mechanics

//Part 1 - Flap Bird Function and Pipes

// Handle bird flap
function flapBird() {
    if (gameOver || !gameStarted) return;

    birdVelocity = jumpForce;

    if (birdImage && flapBirdImages[currentFlapBirdImageIndex]) {
        birdImage.src = flapBirdImages[currentFlapBirdImageIndex].src;
    } else {
        console.error('Bird image or flap bird image is not loaded');
    }

    flapSound.play();
    currentFlapBirdImageIndex = (currentFlapBirdImageIndex + 1) % flapBirdImages.length;
}

// Create pipes
function createPipes() {
    const minHeight = 50;
    const pipeHeight = Math.random() * (canvas.height - PIPE_GAP - minHeight - 2 * PIPE_WIDTH) + PIPE_WIDTH;
    const pipeCapHeight = PIPE_WIDTH / 4;

    pipes.push({
        topPipe: { x: canvas.width, y: 0, height: pipeHeight, capHeight: pipeCapHeight },
        bottomPipe: { x: canvas.width, y: pipeHeight + PIPE_GAP, height: canvas.height - pipeHeight - PIPE_GAP, capHeight: pipeCapHeight },
        scored: false
    });
}
// Draw bird
function drawBird() {
    if (!birdImage) {
        console.error('Bird image is not loaded');
        return;
    }
    ctx.drawImage(
        birdImage,
        canvas.width / 5 - BIRD_RADIUS,
        birdY - BIRD_RADIUS,
        BIRD_RADIUS * 2,
        BIRD_RADIUS * 2);  
}

// Function to draw pipes
function drawPipes() {
    pipes.forEach(pipePair => {
        // Draw top pipe
        ctx.fillStyle = 'green'; // Set the color for the top pipe body
        ctx.fillRect(pipePair.topPipe.x, pipePair.topPipe.y, PIPE_WIDTH, pipePair.topPipe.height);

        ctx.fillStyle = 'black'; // Set the color for the top pipe cap (change 'red' to your desired color)
        ctx.fillRect(pipePair.topPipe.x - (PIPE_WIDTH * 0.1), pipePair.topPipe.height - pipePair.topPipe.capHeight, PIPE_WIDTH * 1.2, pipePair.topPipe.capHeight);

        // Draw bottom pipe
        ctx.fillStyle = 'green'; // Set the color for the bottom pipe body
        ctx.fillRect(pipePair.bottomPipe.x, pipePair.bottomPipe.y, PIPE_WIDTH, pipePair.bottomPipe.height);

        ctx.fillStyle = 'black'; // Set the color for the bottom pipe cap (change 'blue' to your desired color)
        ctx.fillRect(pipePair.bottomPipe.x - (PIPE_WIDTH * 0.1), pipePair.bottomPipe.y, PIPE_WIDTH * 1.2, pipePair.bottomPipe.capHeight);
    });
}

// Part 4 Draw Score and Level and Draw everything on canvas

// Draw score and level
function drawScoreAndLevel() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.fillText(Score: ${score}, 20, 30);
    ctx.fillText(Level: ${level}, 20, 60);
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (showCountdown) {
        drawCountdown();
    } else if (gameStarted) {
        drawGame();
    }

    if (gameOver && gameStarted) {
        handleGameOver();
    } else {
        hideRestartButton();
    }
}

function drawCountdown() {
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText('Get Ready!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(countdownValue, canvas.width / 2, canvas.height / 2 + 20);
}

function drawGame() {
    drawBird();
    drawPipes();
    drawScoreAndLevel();
}

function handleGameOver() {
    flashCounter++;
    if (flashCounter % 60 < 30) {
        checkWinCondition();
        if (playerWon) {
            displayWinMessage();
        } else {
            displayGameOverMessage();
        }
    }

    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.style.position = 'absolute';
        restartButton.style.left = '50%';
        restartButton.style.transform = 'translateX(-50%)';
        restartButton.style.top = ${canvas.height / 2 - 20}px;
        restartButton.style.display = 'block';
    }
}

function hideRestartButton() {
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.style.display = 'none';
    }
}

// Part 5: Check Win Condition and Update Game State

// Function to check for if player has won
function checkWinCondition() {
    if (score >= WIN_SCORE) {
        playerWon = true;
        gameOver = true;
    }
}

// Function to display win message
function displayWinMessage() {
    const winMessage = 'You Win!';
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = playerWonFlashColor;
    ctx.fillText(winMessage, canvas.width / 2, canvas.height / 2 - 40);

    backgroundMusic.pause(); // Pause the background music
    winSound.play(); // Play the winning sound
}

// Function to display game over message
function displayGameOverMessage() {
    const gameOverText = 'Game Over';
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = gameOverFlashColor;
    ctx.fillText(gameOverText, canvas.width / 2, canvas.height / 2 - 40);

    backgroundMusic.pause(); // Pause the background music
    loseSound.play(); // Play the lose sound
}


// Update game state
function update() {
    if (gameOver || !gameStarted) return;

    // Update bird position based on velocity
    birdVelocity += gravity;
    birdY += birdVelocity;

    // Check if bird goes out of bounds or hits obstacles
    if (birdY + BIRD_RADIUS > canvas.height || birdY - BIRD_RADIUS < 0) {
        endGame();
    }

    // Update pipe positions and check collisions
    pipes.forEach(pipePair => {
        pipePair.topPipe.x -= PIPE_SPEED;
        pipePair.bottomPipe.x -= PIPE_SPEED;

        const birdX = canvas.width / 5;
        const birdTop = birdY - BIRD_RADIUS;
        const birdBottom = birdY + BIRD_RADIUS;

        // Check if bird has passed the pipe
        if (pipePair.topPipe.x + PIPE_WIDTH < birdX && !pipePair.scored) {
            pipePair.scored = true;
            score++;
            scoreSound.play().catch(error => console.error('Score sound play failed:', error));
            checkWinCondition(); // Check if the player has won after scoring
        }

        // Check for collision with pipes
        const topPipeCollision = birdX + BIRD_RADIUS > pipePair.topPipe.x &&
                                 birdX - BIRD_RADIUS < pipePair.topPipe.x + PIPE_WIDTH &&
                                 birdTop < pipePair.topPipe.y + pipePair.topPipe.height;

        const bottomPipeCollision = birdX + BIRD_RADIUS > pipePair.bottomPipe.x &&
                                    birdX - BIRD_RADIUS < pipePair.bottomPipe.x + PIPE_WIDTH &&
                                    birdBottom > pipePair.bottomPipe.y;

        if (topPipeCollision || bottomPipeCollision) {
            endGame();
            playRandomHitSound();
        }
    });

    // Remove off-screen pipes
    pipes = pipes.filter(pipePair => pipePair.topPipe.x + PIPE_WIDTH > 0);

    // Spawn new pipes at intervals
    if (frameCount % Math.floor(PIPE_SPAWN_INTERVAL / fixedTimeStep) === 0) {
        createPipes();
    }
    frameCount++;

    // Level up logic
    if (score >= lastLevelUpScore + LEVEL_THRESHOLD) {
        level++;
        PIPE_SPEED += 0.1;
        PIPE_SPAWN_INTERVAL = Math.max(1000, PIPE_SPAWN_INTERVAL - 200);
        lastLevelUpScore = score;
    }
}

// Part 6: Game Initialization, Countdown and Reset

//Init Game and Reset Variables
function initGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    level = 1;
    gameOver = false;
    gameStarted = false;
    frameCount = 0;
    PIPE_SPEED = 2;
    PIPE_SPAWN_INTERVAL = 2000;
    countdownValue = 3;
    countdownComplete = false; // Ensure countdownComplete is reset
    lastLevelUpScore = 0;   

    document.getElementById('startButton').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';

    startCountdown();
}


// Start countdown
function startCountdown() {
    showCountdown = true;
    function countdown(counter) {
        if (counter > 0) {
            countdownValue = counter;
            setTimeout(() => countdown(counter - 1), 1000);
        } else {
            showCountdown = false;
            gameStarted = true; // Start the game after countdown
            console.log('Game started');
            lastTime = performance.now(); // Initialize lastTime when the game starts
            backgroundMusic.play().catch(error => console.error('Background music play failed:', error));
            requestAnimationFrame(gameLoop);
        }
    }
    countdown(3);
}

// Function to end the game
function endGame() {
    gameOver = true;
    playerWon = false; // Set to false when the game ends without a win
    console.log('Game Over');
    backgroundMusic.pause(); // Pause the background music
    loseSound.play(); // Play the lose sound
}
// Part 7: Game Loop and Event Listeners

// Game loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    accumulator += delta;

    while (accumulator >= fixedTimeStep) {
        update();
        accumulator -= fixedTimeStep;
    }

    draw();
    if (!gameOver) {
       requestAnimationFrame(gameLoop);
    }
}

// Event listeners
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('pointerdown', flapBird);
document.getElementById('startButton').addEventListener('click', initGame);
document.getElementById('restartButton').addEventListener('click', initGame);
document.addEventListener('keydown', flapBird);

preloadAssets();
resizeCanvas();
requestAnimationFrame(gameLoop);
