import { cols } from "./constants.js"

export class Tetromino {
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
