import { classic, quintris, hextris } from "./shape-collections.js";
import { Sounds } from "./sounds.js";


//Canvases
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const subCanvas = document.getElementById('hold-menu');
const subCtx = subCanvas.getContext('2d');

let gameMode = 'hextris'
let TETRIMINOS = classic;

switch (gameMode) {
  case 'quintris': TETRIMINOS = [...classic, ...quintris];
    break;

  case 'hextris': TETRIMINOS = [...classic, ...quintris, ...hextris];
    break;

  default:
    break;
};


//Mute button
document.querySelector(".js-mute-music").addEventListener("click", () => Sounds.toggleAudio());

let menu = document.querySelector(".menu")

function startGame() {
  holdTetrimino = {
    shape: 0,
    color: 0
  }
  subCtx.clearRect(0, 0, subCanvas.width, subCanvas.height);


  gameSpeed = 600;
  level = 1;
  levelText.innerHTML = `Level: ${level}`

  score = 0;
  initGrid();

  gameRunning = true;
  menu.style.display = "none";
  ssMenu.style.display = "none";
  Sounds.bgMusic.currentTime = 0;
  Sounds.bgMusic.play()
  gameLoop();
}

let startGameButton = document.querySelector('.js-start-game-button');
startGameButton.addEventListener('click', () => {
  startGame();
}); 


//For gapless audio looping
// bgMusic.addEventListener('timeupdate', function(){
//   let buffer = .35
//   if(this.currentTime > this.duration - buffer){
//       this.currentTime = 0
//       this.play()
//   }
// });


// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#FF33A1',
  '#FFD633',
  '#00d5ff', 
  '#9B33FF',
  '#a60000',
  '#19a600',
  '#0007d9',

];

// Score variables
let score = 0;
let level = 1;
const levelText = document.querySelector(".level-text");
const scoreText = document.querySelector(".score-text");
scoreText.innerHTML = `Score: ${score}`;
levelText.innerHTML = `Level: ${level}`;

// Grid initialization
let grid = [];
initGrid();

function initGrid() {
  for (let row = 0; row < ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < COLS; col++) {
      grid[row][col] = 'EMPTY';
    }
  }
}

// Initial tetrimino
let initialTetrimino = Math.floor(Math.random() * TETRIMINOS.length);
let currentTetrimino = {
  shape: TETRIMINOS[initialTetrimino],
  x: Math.floor(COLS / 2) - 1,
  y: 0,
  color: COLORS[initialTetrimino % 10],
};

let holdUsed = false;

let holdTetrimino = {
  shape: 0,
  x: Math.floor(COLS / 2) - 1,
  y: 0,
  color: 0,
}


function swapTetrimino() {
  if (holdUsed) { return; }

  if (holdTetrimino.shape === 0) {
    holdTetrimino.shape = currentTetrimino.shape;
    holdTetrimino.color = currentTetrimino.color;
  
    let randomIndex = Math.floor(Math.random() * TETRIMINOS.length);
    currentTetrimino = {
      shape: TETRIMINOS[randomIndex],
      x: Math.floor(COLS / 2) - 1,
      y: 0,
      color: COLORS[randomIndex % 10],
    }
  } else {
    [holdTetrimino, currentTetrimino] = [currentTetrimino, holdTetrimino];
    currentTetrimino.x = Math.floor(COLS / 2) - 1;
    currentTetrimino.y = 0;
  }
  drawHoldItem();
  holdUsed = true;
}

// Draw the grid
function drawGrid() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = grid[row][col] === 'EMPTY' ? '#000' : grid[row][col];
      ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
  }
}

function checkLineClear() {
  let clearLine = true

  for (let row = 0; row < 20; row++) {
    clearLine = true
    for (let col = 0; col < 10; col++) {
      if (grid[row][col] === 'EMPTY') {
        clearLine = false
        break;
      }
    }

    //Execute a line clear
    if (clearLine) {
      for (let col = 0; col < 10; col++) {
        grid[row][col] = 'EMPTY'
      } 
      for (let r = row - 1; r >= 0; r--) {
        grid[r + 1] = [...grid[r]];  // Move row r to row r + 1
      }
      grid[0] = new Array(grid[0].length).fill('EMPTY');      
      score += 400 * level;
      scoreText.innerHTML = `Score: ${score}`
      lineClearSound.play();
    }
  }
}


// Draw current tetrimino
function drawTetrimino() {
  for (let row = 0; row < currentTetrimino.shape.length; row++) {
    for (let col = 0; col < currentTetrimino.shape[row].length; col++) {
      if (currentTetrimino.shape[row][col] !== 0) {
        ctx.fillStyle = currentTetrimino.color;
        ctx.fillRect(
          (currentTetrimino.x + col) * BLOCK_SIZE,
          (currentTetrimino.y + row) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    }
  }
}

function drawHoldItem() {
  subCtx.clearRect(0, 0, subCanvas.width, subCanvas.height);

  const tetriminoWidth = holdTetrimino.shape[0].length * 20;  // Width in pixels
  const tetriminoHeight = holdTetrimino.shape.length * 20;    // Height in pixels

  const offsetX = (subCanvas.width - tetriminoWidth) / 2;    // Center X
  const offsetY = (subCanvas.height - tetriminoHeight) / 2;  // Center Y

  for (let row = 0; row < holdTetrimino.shape.length; row++) {
    for (let col = 0; col < holdTetrimino.shape[row].length; col++) {
      if (holdTetrimino.shape[row][col] !== 0) {
        subCtx.fillStyle = holdTetrimino.color;
        subCtx.fillRect(
          offsetX + (col * 20),  // Centered X
          offsetY + (row * 20),  // Centered Y
          20,
          20
        );
      }
    }
  }
}

// Check for collision
function collision() {
  for (let row = 0; row < currentTetrimino.shape.length; row++) {
    for (let col = 0; col < currentTetrimino.shape[row].length; col++) {
      if (currentTetrimino.shape[row][col] !== 0) {
        let newX = currentTetrimino.x + col;
        let newY = currentTetrimino.y + row;
        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          grid[newY][newX] !== 'EMPTY'
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Lock tetrimino into grid
function lockTetrimino() {
  for (let row = 0; row < currentTetrimino.shape.length; row++) {
    for (let col = 0; col < currentTetrimino.shape[row].length; col++) {
      if (currentTetrimino.shape[row][col] !== 0) {
        grid[currentTetrimino.y + row][currentTetrimino.x + col] =
          currentTetrimino.color;
      }
    }
  }
  score += 40 * level
  scoreText.innerHTML = `Score: ${score}`;
  pieceDownSound.currentTime = 0;
  pieceDownSound.play();
  checkLineClear();
}

// Move tetrimino down
function moveTetrimino() {
  currentTetrimino.y++;
  if (collision()) {
    currentTetrimino.y--;
    lockTetrimino();
    holdUsed = false;
    let randomIndex = Math.floor(Math.random() * TETRIMINOS.length);
    currentTetrimino = {
      shape: TETRIMINOS[randomIndex],
      x: Math.floor(COLS / 2) - 1,
      y: 0,
      color: COLORS[randomIndex % 10],
    };
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


  // Redraw the game immediately after moving
  draw();
});

//Start/Pause button
document.addEventListener('keydown', (event) => {
  if (event.key === "p") {
    gameRunning = !gameRunning;
    gameLoop();
  }
});

// Function to draw the grid and Tetrimino (moved from gameLoop)
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawTetrimino();
}

// Rotate tetrimino
function rotateTetrimino() {
  let shape = currentTetrimino.shape;
  currentTetrimino.shape = currentTetrimino.shape[0]
    .map((_, index) => currentTetrimino.shape.map(row => row[index]))
    .reverse();
  if (collision()) {
    currentTetrimino.shape = shape;
  }
}

let ssMenu = document.querySelector(".submit-score-menu")

function checkGameOver() {
  if (grid[0][5] !== 'EMPTY' || grid[0][4] !== 'EMPTY' || grid[0][6] !== 'EMPTY') {
      gameRunning = false;
      // bgMusic.pause();
      gameOverSound.play();
      ssMenu.style.display = "flex"
  }
}


let gameSpeed = 600;
let gameRunning = false;

function increaseLevel() {
  level += 1;
  levelText.innerHTML = `Level: ${level}`
  if (gameSpeed > 25) {
    gameSpeed -= 50;
  } 
}

setInterval(increaseLevel, 30000);

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

gameLoop();




