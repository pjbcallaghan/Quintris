import { Leaderboard } from "./leaderboard.js";

export class UI {
  constructor() {
    // UI Variables
    this.score = 0;
    this.gameOver = false;
    this.scoreSubmitted = false;
    this.gameMode = 'Quintris';

    // DOM Elements
    this.scoreText = document.querySelector(".score-text");
    this.levelText = document.querySelector(".level-text");
    this.menu = document.querySelector(".menu");
    this.modeMenu = document.querySelector(".mode-menu");
    this.startGameButton = document.querySelector(".js-start-game-button");
    this.ssMenu = document.querySelector(".submit-score-menu");
    this.playAgain = document.querySelector(".js-play-again");
    this.selectModeButton = document.querySelector(".js-select-mode-button");
    this.classicButton = document.querySelector(".js-classic-button");
    this.quintrisButton = document.querySelector(".js-quintris-button");
    this.hextrisButton = document.querySelector(".js-hextris-button");

    // Initialize the Leaderboard class (child)
    this.leaderboard = new Leaderboard();

    // Bind events for UI actions
    this.bindEvents();
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
    this.gameOver = true;
    this.ssMenu.style.display = "flex";
  }

  changeGameMode(mode) {
    this.gameMode = mode;
    this.menu.style.display = "flex";
    this.modeMenu.style.display = "none";
  }

  bindEvents() {
    this.selectModeButton.addEventListener('click', () => this.showSelectMode());
    this.classicButton.addEventListener('click', () => this.changeGameMode('Classic'));
    this.quintrisButton.addEventListener('click', () => this.changeGameMode('Quintris'));
    this.hextrisButton.addEventListener('click', () => this.changeGameMode('Hextris'));
    this.leaderboard.submitScoreButton.addEventListener('click', () => this.submitScore());
    this.leaderboard.leaderboardBackButton.addEventListener('click', () => this.returnToMenu());
    this.leaderboard.prevPageButton.addEventListener('click', () => this.leaderboard.changePage('prev'));
    this.leaderboard.nextPageButton.addEventListener('click', () => this.leaderboard.changePage('next'));

    document.querySelectorAll(".js-view-lb-button").forEach(button => {
      button.addEventListener("click", () => {
        this.leaderboard.viewLeaderboard();
        this.showMenu();  
      });
    });
  }

  returnToMenu() {
    this.leaderboard.returnToMenu();
    if (!this.gameOver) {
      this.menu.style.display = 'flex';
    } else {
      this.ssMenu.style.display = 'flex';
    }
  }

  async submitScore() {
    const name = document.querySelector(".ss-input").value;
    const score = this.score;
    const mode = this.gameMode;
    await this.leaderboard.submitScore(name, score, mode);
  }

  bindStartGame(callback) {
    this.startGameButton.addEventListener('click', callback);
    this.playAgain.addEventListener('click', callback);
  }
}

