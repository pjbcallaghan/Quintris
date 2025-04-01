export class UI {
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
