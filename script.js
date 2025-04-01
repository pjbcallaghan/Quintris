import { classic, quintris, hextris } from "./shape-collections.js";
import { Sounds } from "./sounds.js";

// Initialize sounds
Sounds.init();

// Canvases and contexts
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const subCanvas = document.getElementById('hold-menu');
const subCtx = subCanvas.getContext('2d');

// Game mode configuration
const gameModes = {
  classic,
  quintris: [...classic, ...quintris],
  hextris: [...classic, ...quintris, ...hextris],
};

let gameMode = 'hextris';
let TETRIMINOS = gameModes[gameMode];

// Menu elements
let menu = document.querySelector(".menu");
let ssMenu = document.querySelector(".submit-score-menu");
let startGameButton = document.querySelector('.js-start-game-button');

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD633', '#00d5ff', 
  '#9B33FF', '#a60000', '#19a600', '#0007d9',
];

// Score elements
const scoreText = document.querySelector(".score-text");
const levelText = document.querySelector(".level-text");

// Game variables
let score = 0;
let level = 1;
let gameRunning = false;
let gameSpeed = 600;
let currentTetrimino, holdTetrimino, holdUsed = false;
let grid = [];

// Initialize game grid
function initGrid() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill('EMPTY'));
}

// Initialize the game
function startGame() {
  resetGameVariables();
  Sounds.bgMusic.currentTime = 0;
  Sounds.bgMusic.play();
  menu.style.display = "none";
  ssMenu.style.display = "none";
  gameRunning = true;
  gameLoop();
}

// Reset game variables
function resetGameVariables() {
  score = 0;
  level = 1;
  levelText.innerHTML = `Level: ${level}`;
  scoreText.innerHTML = `Score: ${score}`;
  initGrid();

  holdTetrimino = { shape: 0, color: 0 };
  currentTetrimino = generateRandomTetrimino();
  holdUsed = false;
}

// Generate a random tetrimino
function generateRandomTetrimino() {
  const randomIndex = Math.floor(Math.random() * TETRIMINOS.length);
  return {
    shape: TETRIMINOS[randomIndex],
    x: Math.floor(COLS / 2) - 1,
    y: 0,
    color: COLORS[randomIndex % 10],
  };
}

// Handle the start game button click
startGameButton.addEventListener('click', startGame);

// Draw the grid on canvas
function drawGrid() {
  grid.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      ctx.fillStyle = col === 'EMPTY' ? '#000' : col;
      ctx.fillRect(colIndex * BLOCK_SIZE, rowIndex * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    });
  });
}

// Draw the current tetrimino on the canvas
function drawTetrimino() {
  currentTetrimino.shape.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col !== 0) {
        ctx.fillStyle = currentTetrimino.color;
        ctx.fillRect(
          (currentTetrimino.x + colIndex) * BLOCK_SIZE,
          (currentTetrimino.y + rowIndex) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    });
  });
}

// Handle tetrimino collision
function collision() {
  return currentTetrimino.shape.some((row, rowIndex) => 
    row.some((col, colIndex) => 
      col !== 0 && (
        currentTetrimino.x + colIndex < 0 ||
        currentTetrimino.x + colIndex >= COLS ||
        currentTetrimino.y + rowIndex >= ROWS ||
        grid[currentTetrimino.y + rowIndex][currentTetrimino.x + colIndex] !== 'EMPTY'
      )
    )
  );
}

// Lock the tetrimino into the grid
function lockTetrimino() {
  currentTetrimino.shape.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col !== 0) {
        grid[currentTetrimino.y + rowIndex][currentTetrimino.x + colIndex] = currentTetrimino.color;
      }
    });
  });
  score += 40 * level;
  scoreText.innerHTML = `Score: ${score}`;
  Sounds.pieceDownSound.currentTime = 0;
  Sounds.pieceDownSound.play();
  checkLineClear();
}

// Check and clear lines
function checkLineClear() {
  grid.forEach((row, rowIndex) => {
    if (row.every(col => col !== 'EMPTY')) {
      grid.splice(rowIndex, 1);
      grid.unshift(Array(COLS).fill('EMPTY'));
      score += 400 * level;
      scoreText.innerHTML = `Score: ${score}`;
      Sounds.lineClearSound.play();
    }
  });
}

// Move the tetrimino down by 1
function moveTetrimino() {
  currentTetrimino.y++;
  if (collision()) {
    currentTetrimino.y--;
    lockTetrimino();
    holdUsed = false;
    currentTetrimino = generateRandomTetrimino();
  }
}

// Handle tetrimino rotation
function rotateTetrimino() {
  const rotatedShape = currentTetrimino.shape[0].map((_, index) => 
    currentTetrimino.shape.map(row => row[index])
  ).reverse();
  const originalShape = currentTetrimino.shape;
  currentTetrimino.shape = rotatedShape;

  if (collision()) {
    currentTetrimino.shape = originalShape;
  }
}

// Swap tetrimino with held tetrimino
function swapTetrimino() {
  if (holdUsed) return;

  if (holdTetrimino.shape === 0) {
    holdTetrimino = { ...currentTetrimino };
    currentTetrimino = generateRandomTetrimino();
  } else {
    [holdTetrimino, currentTetrimino] = [currentTetrimino, holdTetrimino];
    currentTetrimino.x = Math.floor(COLS / 2) - 1;
    currentTetrimino.y = 0;
  }

  drawHoldItem();
  holdUsed = true;
}

// Draw the held tetrimino on the submenu canvas
function drawHoldItem() {
  subCtx.clearRect(0, 0, subCanvas.width, subCanvas.height);

  const width = holdTetrimino.shape[0].length * 20;
  const height = holdTetrimino.shape.length * 20;

  const offsetX = (subCanvas.width - width) / 2;
  const offsetY = (subCanvas.height - height) / 2;

  holdTetrimino.shape.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col !== 0) {
        subCtx.fillStyle = holdTetrimino.color;
        subCtx.fillRect(
          offsetX + (colIndex * 20),
          offsetY + (rowIndex * 20),
          20,
          20
        );
      }
    });
  });
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawTetrimino();
  moveTetrimino();
  checkGameOver();

  setTimeout(gameLoop, gameSpeed); // Adjust speed by changing the timeout
}

// Check for game over
function checkGameOver() {
  if (grid[0].some(col => col !== 'EMPTY')) {
    gameRunning = false;
    Sounds.bgMusic.pause();
    Sounds.gameOverSound.play();
    ssMenu.style.display = "flex";
  }
}

// Handle user input
document.addEventListener('keydown', (event) => {
  if (event.key === "ArrowLeft" || event.key === "a") {
    currentTetrimino.x--;
    if (collision()) currentTetrimino.x++; // Revert if collision
  }

  if (event.key === "ArrowRight" || event.key === "d") {
    currentTetrimino.x++;
    if (collision()) currentTetrimino.x--; // Revert if collision
  }

  if (event.key === "ArrowDown" || event.key === "s") {
    currentTetrimino.y++;
    if (collision()) currentTetrimino.y--; // Revert if collision
  }

  if (event.key === "ArrowUp" || event.key === "w") {
    rotateTetrimino();
  }

  if (event.key === " ") {
    swapTetrimino();
  }

  draw(); // Redraw the game immediately after moving
});

// Toggle game pause with "p" key
document.addEventListener('keydown', (event) => {
  if (event.key === "p") {
    gameRunning = !gameRunning;
    gameLoop();
  }
});

// Draw the game (grid + tetrimino)
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawTetrimino();
}

// Increase level every 30 seconds
setInterval(() => {
  level += 1;
  levelText.innerHTML = `Level: ${level}`;
  if (gameSpeed > 25) {
    gameSpeed -= 50;
  }
}, 30000);
