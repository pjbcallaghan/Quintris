import { classic, quintris, hextris } from "./shapes.js";

export class UI {
  constructor() {
    this.scoreText = document.querySelector(".score-text");
    this.levelText = document.querySelector(".level-text");
    this.menu = document.querySelector(".menu");
    this.modeMenu = document.querySelector(".mode-menu");
    this.ssMenu = document.querySelector(".submit-score-menu");
    this.startGameButton = document.querySelector(".js-start-game-button");

    this.selectModeButton = document.querySelector(".js-select-mode-button");
    this.classicButton = document.querySelector(".js-classic-button");
    this.quintrisButton = document.querySelector(".js-quintris-button");
    this.hextrisButton = document.querySelector(".js-hextris-button");
    this.gameMode = [...classic, ...quintris];
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

  showSelectMode() {
    this.menu.style.display = "none";
    this.modeMenu.style.display = "flex";
  }


  showGameOver() {
    this.ssMenu.style.display = "flex";
  }

  changeGameMode(mode) {
    switch (mode) {
      case classic:
        this.gameMode = classic;
        break;

      case quintris:
        this.gameMode = [...classic, ...quintris];
        break;

      case hextris:
        this.gameMode = [...classic, ...quintris, ...hextris];
        break;
    }

    this.menu.style.display = "flex";
    this.modeMenu.style.display = "none";

  }

  bindEvents() {
    this.selectModeButton.addEventListener('click', () => this.showSelectMode());
    this.classicButton.addEventListener('click', () => this.changeGameMode(classic));
    this.quintrisButton.addEventListener('click',  () => this.changeGameMode(quintris));
    this.hextrisButton .addEventListener('click', () => this.changeGameMode(hextris));
  }

  bindStartGame(callback) {
    this.startGameButton.addEventListener('click', callback);
  }

}
