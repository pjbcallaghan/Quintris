import { Sounds } from "./sounds.js";

export class Grid {
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
