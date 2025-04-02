import { Sounds } from "./sounds.js";
import { UI } from "./ui.js";
import { Grid } from "./grid.js";
import { Tetromino } from "./tetromino.js";
import { classic, quintris, hextris } from "./shapes.js";
import { canvas, ctx, subCanvas, subCtx, cols, rows, blockSize, colors } from "./constants.js"

export class Game {
  constructor() {
    this.ui = new UI();
    this.grid = new Grid(cols, rows);
    this.tetrominos = [...classic, ...quintris];
    this.currentTetromino = Tetromino.generateRandom(this.tetrominos, colors);
    this.holdTetromino = new Tetromino(0, 0, 0, 0);
    this.holdUsed = false;
    this.score = 0;
    this.level = 1;
    this.gameSpeed = 750;
    this.gameRunning = false;

    this.ui.bindEvents();
    this.ui.bindStartGame(() => this.startGame());
    Sounds.init();
  }
  
  startGame() {
    Sounds.bgMusic.currentTime = 0;
    Sounds.bgMusic.play();
    switch (this.ui.gameMode) {
      case 'Classic':
        this.tetrominos = classic;
      case 'Quintris':
        this.tetrominos = [...classic, ...quintris];
      case 'Hextris':
        this.tetrominos = [...classic, ...quintris, ...hextris];
    }
    this.ui.gameOver = false;
    this.ui.showMenu();
    this.grid.reset();
    this.score = 0;
    this.level = 1;
    this.gameRunning = true;
    this.ui.updateScore(this.score);
    this.ui.updateLevel(this.level);
    this.currentTetromino = Tetromino.generateRandom(this.tetrominos, colors);
    setInterval(() => this.increaseLevel(), 30000);
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

  increaseLevel() {
    this.level += 1;
    this.ui.updateLevel(this.level);
    if (this.gameSpeed > 25) {
      this.gameSpeed -= 50;
    };
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

  checkGameOver() {
    if (
      this.grid.getGrid()[0][4] !== 'EMPTY' ||
      this.grid.getGrid()[0][5] !== 'EMPTY' ||
      this.grid.getGrid()[0][6] !== 'EMPTY'
    ) {
      this.gameRunning = false;
      this.ui.score = this.score;
      this.ui.scoreSubmitted = false;
      Sounds.bgMusic.pause();
      Sounds.gameOverSound.play();
      this.ui.showGameOver();
    }
  }

  //Rendering Functions
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
        };
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


  //User Controls
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