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

  lockTetrimino(tetrimino) {
    tetrimino.shape.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col !== 0) {
          this.grid[tetrimino.y + rowIndex][tetrimino.x + colIndex] = tetrimino.color;
          Sounds.pieceDownSound.currentTime = 0;
          Sounds.pieceDownSound.play();
        }
      });
    });
  }

  checkCollision(tetrimino) {
    return tetrimino.shape.some((row, rowIndex) =>
      row.some((col, colIndex) =>
        col !== 0 && (
          tetrimino.x + colIndex < 0 ||
          tetrimino.x + colIndex >= this.cols ||
          tetrimino.y + rowIndex >= this.rows ||
          this.grid[tetrimino.y + rowIndex][tetrimino.x + colIndex] !== 'EMPTY'
        )
      )
    );
  }

  getGrid() {
    return this.grid;
  }
}

// Tetrimino Class
class Tetrimino {
  constructor(shape, x, y, color) {
    this.shape = shape;
    this.x = x;
    this.y = y;
    this.color = color;
  }

  static generateRandom(tetriminos, colors) {
    const randomIndex = Math.floor(Math.random() * tetriminos.length);
    return new Tetrimino(tetriminos[randomIndex], Math.floor(cols / 2) - 1, 0, colors[randomIndex % 10]);
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
    this.tetriminos = classic; // Default Tetriminos
    this.currentTetrimino = Tetrimino.generateRandom(this.tetriminos, colors);
    this.holdTetrimino = new Tetrimino(0, 0, 0, 0);
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
    this.currentTetrimino = Tetrimino.generateRandom(this.tetriminos, colors);
    this.gameLoop();
  }

  gameLoop() {
    if (!this.gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.grid.draw(ctx, blockSize);
    this.drawTetrimino();
    this.moveTetrimino();
    this.checkGameOver();

    setTimeout(() => this.gameLoop(), this.gameSpeed);
  }

  moveTetrimino() {
    this.currentTetrimino.moveDown();
    if (this.grid.checkCollision(this.currentTetrimino)) {
      this.currentTetrimino.y--;
      this.grid.lockTetrimino(this.currentTetrimino);
      this.score += 40 * this.level;
      this.ui.updateScore(this.score);
      this.grid.clearLine();
      this.currentTetrimino = Tetrimino.generateRandom(this.tetriminos, colors);
    }
  }

  rotateTetrimino() {
    const originalShape = this.currentTetrimino.shape;
    this.currentTetrimino.rotate();
    if (this.grid.checkCollision(this.currentTetrimino)) {
      this.currentTetrimino.shape = originalShape;
    }
  }

  swapTetrimino() {
    if (this.holdUsed) return;
    const temp = this.currentTetrimino;
    this.currentTetrimino = this.holdTetrimino;
    this.holdTetrimino = temp;
    this.holdTetrimino.resetPosition();
    this.holdUsed = true;
  }

  drawTetrimino() {
    this.currentTetrimino.shape.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col !== 0) {
          ctx.fillStyle = this.currentTetrimino.color;
          ctx.fillRect(
            (this.currentTetrimino.x + colIndex) * blockSize,
            (this.currentTetrimino.y + rowIndex) * blockSize,
            blockSize,
            blockSize
          );
        }
      });
    });
  }

  checkGameOver() {
    if (this.grid.getGrid()[0].some(col => col !== 'EMPTY')) {
      this.gameRunning = false;
      Sounds.bgMusic.pause();
      Sounds.gameOverSound.play();
      this.ui.showGameOver();
    }
  }

  handleInput(event) {
    switch (event.key) {
      case "ArrowLeft":
      case "a":
        this.currentTetrimino.moveLeft();
        if (this.grid.checkCollision(this.currentTetrimino)) {
          this.currentTetrimino.x++;
        }
        this.grid.draw(ctx, blockSize);
        this.drawTetrimino();
        break;

      case "ArrowRight":
      case "d":
        this.currentTetrimino.moveRight();
        if (this.grid.checkCollision(this.currentTetrimino)) {
          this.currentTetrimino.x--;
        }
        this.grid.draw(ctx, blockSize);
        this.drawTetrimino();
        break;

      case "ArrowDown":
      case "s":
        this.moveTetrimino();
        this.grid.draw(ctx, blockSize);
        this.drawTetrimino();
        break;

      case "ArrowUp":
      case "w":
        this.rotateTetrimino();
        this.grid.draw(ctx, blockSize);
        this.drawTetrimino();
        break;

      case " ":
        this.swapTetrimino();
        this.grid.draw(ctx, blockSize);
        this.drawTetrimino();
        break;

      case "p":
        this.gameRunning = !this.gameRunning;
        this.gameLoop();
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
