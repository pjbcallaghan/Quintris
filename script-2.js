import { classic, quintris, hextris } from "./shape-collections.js";
import { Sounds } from "./sounds.js";

// Initialize sounds
Sounds.init();

// Canvases and contexts
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const subCanvas = document.getElementById('hold-menu');
const subCtx = subCanvas.getContext('2d');


// Constants
const cols = 10;
const rows = 20;
const blockSize = 30;
const colors = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD633', '#00d5ff',
  '#9B33FF', '#a60000', '#19a600', '#0007d9',
];

// UI Class
class UI {
  constructor() {
    this.scoreText = document.querySelector(".score-text");
    this.levelText = document.querySelector(".level-text");
    this.menu = document.querySelector(".menu");
    this.ssMenu = document.querySelector(".submit-score-menu");
    this.startGameButton = document.querySelector('.js-start-game-button');
  }

  updateScore(score) {
    this.scoreText.innerHTML = `Score: ${score}`;
  }

  updateLevel(level) {
    this.levelText.innerHTML = `Level: ${level}`;
  }

  showMenu() {
    this.menu.style.display = "none";
    this.ssMenu.style.display = "none";
  }

  showGameOver() {
    this.ssMenu.style.display = "flex";
  }

  bindStartGame(callback) {
    this.startGameButton.addEventListener('click', callback);
  }
}

// Grid Class
class Grid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill('EMPTY'));
  }

  reset() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill('EMPTY'));
  }

  draw(ctx, blockSize) {
    this.grid.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        ctx.fillStyle = col === 'EMPTY' ? '#000' : col;
        ctx.fillRect(colIndex * blockSize, rowIndex * blockSize, blockSize, blockSize);
      });
    });
  }

  clearLine() {
    this.grid.forEach((row, rowIndex) => {
      if (row.every(col => col !== 'EMPTY')) {
        this.grid.splice(rowIndex, 1);
        this.grid.unshift(Array(this.cols).fill('EMPTY'));
        Sounds.lineClearSound.play();
      }
    });
  }

  lockTetromino(tetromino) {
    tetromino.shape.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col !== 0) {
          this.grid[tetromino.y + rowIndex][tetromino.x + colIndex] = tetromino.color;
          Sounds.pieceDownSound.currentTime = 0;
          Sounds.pieceDownSound.play();
        }
      });
    });
  }

  checkCollision(tetromino) {
    return tetromino.shape.some((row, rowIndex) =>
      row.some((col, colIndex) =>
        col !== 0 && (
          tetromino.x + colIndex < 0 ||
          tetromino.x + colIndex >= this.cols ||
          tetromino.y + rowIndex >= this.rows ||
          this.grid[tetromino.y + rowIndex][tetromino.x + colIndex] !== 'EMPTY'
        )
      )
    );
  }

  getGrid() {
    return this.grid;
  }
}

// Tetrimino Class
class Tetromino {
  constructor(shape, x, y, color) {
    this.shape = shape;
    this.x = x;
    this.y = y;
    this.color = color;
  }

  static generateRandom(tetrominos, colors) {
    const randomIndex = Math.floor(Math.random() * tetrominos.length);
    return new Tetromino(tetrominos[randomIndex], Math.floor(cols / 2) - 1, 0, colors[randomIndex % 10]);
  }

  rotate() {
    const rotatedShape = this.shape[0].map((_, index) =>
      this.shape.map(row => row[index])
    ).reverse();
    const originalShape = this.shape;
    this.shape = rotatedShape;
    return this.shape;
  }

  moveDown() {
    this.y++;
  }

  moveLeft() {
    this.x--;
  }

  moveRight() {
    this.x++;
  }

  resetPosition() {
    this.x = Math.floor(cols / 2) - 1;
    this.y = 0;
  }
}

// Game Class
class Game {
  constructor() {
    this.ui = new UI();
    this.grid = new Grid(cols, rows);
    this.tetrominos = classic;
    this.currentTetromino = Tetromino.generateRandom(this.tetrominos, colors);
    this.holdTetromino = new Tetromino(0, 0, 0, 0);
    this.holdUsed = false;
    this.score = 0;
    this.level = 1;
    this.gameSpeed = 600;
    this.gameRunning = false;

    this.ui.bindStartGame(() => this.startGame());
  }

  startGame() {
    Sounds.bgMusic.play();
    this.ui.showMenu();
    this.grid.reset();
    this.score = 0;
    this.level = 1;
    this.gameRunning = true;
    this.ui.updateScore(this.score);
    this.ui.updateLevel(this.level);
    this.currentTetromino = Tetromino.generateRandom(this.tetrominos, colors);
    this.gameLoop();
  }

  gameLoop() {
    if (!this.gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.grid.draw(ctx, blockSize);
    this.drawTetromino();
    this.moveTetromino();
    this.checkGameOver();

    setTimeout(() => this.gameLoop(), this.gameSpeed);
  }

  moveTetromino() {
    this.currentTetromino.moveDown();
    if (this.grid.checkCollision(this.currentTetromino)) {
      this.currentTetromino.y--;
      this.grid.lockTetromino(this.currentTetromino);
      this.score += 40 * this.level;
      this.ui.updateScore(this.score);
      this.grid.clearLine();
      this.currentTetromino = Tetromino.generateRandom(this.tetrominos, colors);
      this.holdUsed = false;  
    }
  }

  rotateTetromino() {
    const originalShape = this.currentTetromino.shape;
    this.currentTetromino.rotate();
    if (this.grid.checkCollision(this.currentTetromino)) {
      this.currentTetromino.shape = originalShape;
    }
  }

  swapTetromino() {
    if (this.holdUsed) return;
    if (this.holdTetromino.color === 0) {
      this.holdTetromino = this.currentTetromino 
      this.holdTetromino.resetPosition();
      this.currentTetromino = Tetromino.generateRandom(this.tetrominos, colors)
    } else {
      const temp = this.currentTetromino;
      this.currentTetromino = this.holdTetromino;
      this.holdTetromino = temp;
      this.holdTetromino.resetPosition();
    }
    this.holdUsed = true;  
  }

  drawHold() {
    subCtx.clearRect(0, 0, subCanvas.width, subCanvas.height);
    const tetrominoWidth = this.holdTetromino.shape[0].length * 20;  // Width in pixels
    const tetrominoHeight = this.holdTetromino.shape.length * 20;    // Height in pixels
    const offsetX = (subCanvas.width - tetrominoWidth) / 2;    // Center X
    const offsetY = (subCanvas.height - tetrominoHeight) / 2;  // Center Y
    this.holdTetromino.shape.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col !== 0) {
          subCtx.fillStyle = this.holdTetromino.color;
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

  drawTetromino() {
    this.currentTetromino.shape.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col !== 0) {
          ctx.fillStyle = this.currentTetromino.color;
          ctx.fillRect(
            (this.currentTetromino.x + colIndex) * blockSize,
            (this.currentTetromino.y + rowIndex) * blockSize,
            blockSize,
            blockSize
          );
        }
      });
    });
  }

  checkGameOver() {
    if (
      this.grid.getGrid()[0][4] !== 'EMPTY' || 
      this.grid.getGrid()[0][5] !== 'EMPTY' || 
      this.grid.getGrid()[0][6] !== 'EMPTY'
    ) {
      this.gameRunning = false;
      Sounds.bgMusic.pause();
      Sounds.gameOverSound.play();
      this.ui.showGameOver();
    }
  }

  handleInput(event) {
    if (event.key === "p") {
      this.gameRunning = !this.gameRunning;
      this.gameLoop();
    }

    if (!this.gameRunning) { return }
    switch (event.key) {
      case "ArrowLeft":
      case "a":
        this.currentTetromino.moveLeft();
        if (this.grid.checkCollision(this.currentTetromino)) {
          this.currentTetromino.x++;
        }
        this.grid.draw(ctx, blockSize);
        this.drawTetromino();
        break;

      case "ArrowRight":
      case "d":
        this.currentTetromino.moveRight();
        if (this.grid.checkCollision(this.currentTetromino)) {
          this.currentTetromino.x--;
        }
        this.grid.draw(ctx, blockSize);
        this.drawTetromino();
        break;

      case "ArrowDown":
      case "s":
        this.moveTetromino();
        this.grid.draw(ctx, blockSize);
        this.drawTetromino();
        break;

      case "ArrowUp":
      case "w":
        this.rotateTetromino();
        this.grid.draw(ctx, blockSize);
        this.drawTetromino();
        break;

      case " ":
        this.swapTetromino();
        this.grid.draw(ctx, blockSize);
        this.drawTetromino();
        this.drawHold();
        break;
    }
  }
}

// Initialize the game
const game = new Game();

// Event listener for keyboard input
document.addEventListener('keydown', (event) => {
  game.handleInput(event);
});
