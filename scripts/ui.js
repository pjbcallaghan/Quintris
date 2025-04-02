export class UI {
  constructor() {
    //UI Variables
    this.score = 0;
    this.gameOver = false;
    this.scoreSubmitted = false;
    this.gameMode = 'Quintris';
    this.leaderboardContents = [];


    //DOM Elements
    this.scoreText = document.querySelector(".score-text");
    this.levelText = document.querySelector(".level-text");
    this.menu = document.querySelector(".menu");
    this.modeMenu = document.querySelector(".mode-menu");
    this.startGameButton = document.querySelector(".js-start-game-button");

    this.ssMenu = document.querySelector(".submit-score-menu");
    this.submitScoreButton = document.querySelector(".js-submit-score");
    this.playAgain = document.querySelector(".js-play-again");

    this.selectModeButton = document.querySelector(".js-select-mode-button");
    this.classicButton = document.querySelector(".js-classic-button");
    this.quintrisButton = document.querySelector(".js-quintris-button");
    this.hextrisButton = document.querySelector(".js-hextris-button");

    this.viewLeaderboardButtons = document.querySelectorAll(".js-view-lb-button")
    this.leaderboard = document.querySelector(".leaderboard");
    this.leaderboardEntries = document.querySelector(".leaderboard-entries");
    this.leaderboardBackButton = document.querySelector(".leaderboard-back-button");
    this.leaderboardPageNext = document.getElementById("scoreboard-button-next");
    this.leaderboardPageBack = document.getElementById("scoreboard-button-back");
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
    this.submitScoreButton.addEventListener('click', () => this.submitScore());
    this.leaderboardBackButton.addEventListener('click', () => this.returnToMenu());

    this.viewLeaderboardButtons.forEach(button => {
      button.addEventListener("click", () => {
        this.viewLeaderboard();
      });
    });
  }

  returnToMenu() {
    this.leaderboard.style.display = 'none';
    if (!this.gameOver) {
      this.menu.style.display = 'flex'
    } else {
      this.ssMenu.style.display = 'flex'
    }
  }

  async viewLeaderboard() {
    await this.fetchLeaderboard(); 

    let htmlContent = "";
    for (let i = 0; i < 8; i++) {
        if (this.leaderboardContents[i] !== undefined) {
            htmlContent += `
            <div class="leaderboard-entry">
                <div class="user-rank">
                  ${i + 1}
                </div>
                <div class="user-name">
                  ${this.leaderboardContents[i].name} 
                </div>
                <div class="user-score">
                  ${this.leaderboardContents[i].score} 
                </div>
            </div>
            `;
        } else {
            break;
        }
    }

    this.leaderboardEntries.innerHTML = htmlContent;
    this.menu.style.display = "none";
    this.ssMenu.style.display = "none";
    this.leaderboard.style.display = "flex";
}

  bindStartGame(callback) {
    this.startGameButton.addEventListener('click', callback);
    this.playAgain.addEventListener('click', callback);
  }


  async fetchLeaderboard() {
    const res = await fetch("http://localhost:3000/leaderboard");
    const scores = await res.json();
    this.leaderboardContents = [
      ...this.leaderboardContents.filter(existing =>
          !scores.some(newEntry => newEntry.name === existing.name)
      ),
      ...scores
    ];
  }

  async submitScore() {
    if (this.scoreSubmitted === true) { return };
    this.scoreSubmitted = true;
    this.submitScoreButton.innerHTML = 'Score submitted'

    const name = document.querySelector(".ss-input").value;
    const score = this.score;
    const mode = this.gameMode

    const response = await fetch("http://localhost:3000/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, score, mode })
    });

    const data = await response.json();
    console.log("Response:", data);
  }
}
