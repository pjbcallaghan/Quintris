export class Leaderboard {
  constructor() {
    // Initialize leaderboard-specific variables
    this.leaderboardContents = [];
    this.leaderboardEntries = document.querySelector(".leaderboard-entries");
    this.leaderboard = document.querySelector(".leaderboard");
    this.leaderboardBackButton = document.querySelector(".leaderboard-back-button");
    this.submitScoreButton = document.querySelector(".js-submit-score");
    this.prevPageButton = document.getElementById("scoreboard-button-back");
    this.nextPageButton = document.getElementById("scoreboard-button-next");
    this.scoreSubmitted = false;
    this.score = 0;
    this.gameMode = 'Quintris';
    this.currentPage = 0;
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

  async submitScore(name, score, mode) {
    if (this.scoreSubmitted === true) { return }
    this.scoreSubmitted = true;
    this.submitScoreButton.innerHTML = 'Score submitted';

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

  async viewLeaderboard() {
    await this.fetchLeaderboard();

    let htmlContent = "";
    for (let i = 0; i < 8; i++) {
      if (this.leaderboardContents[i] !== undefined) {
        htmlContent += `
          <div class="leaderboard-entry">
            <div class="user-rank">${i + 1}</div>
            <div class="user-name">${this.leaderboardContents[i].name}</div>
            <div class="user-score">${this.leaderboardContents[i].score}</div>
          </div>
        `;
      } else {
        break;
      }
    }

    this.leaderboardEntries.innerHTML = htmlContent;
    this.leaderboard.style.display = "flex";
  }

  returnToMenu() {
    this.leaderboard.style.display = 'none';
  }

  changePage(direction) {
    const totalEntries = this.leaderboardContents.length;
    const totalPages = Math.ceil(totalEntries / 8);

    if (direction === "next" && this.currentPage < totalPages - 1) {
      this.currentPage += 1;
    } else if (direction === "prev" && this.currentPage > 0) {
      this.currentPage -= 1;
    } else {
      return;
    }

    const startIdx = this.currentPage * 8;
    const endIdx = Math.min(startIdx + 8, totalEntries);

    let htmlContent = "";
    for (let i = startIdx; i < endIdx; i++) {
      htmlContent += `
        <div class="leaderboard-entry">
          <div class="user-rank">${i + 1}</div>
          <div class="user-name">${this.leaderboardContents[i].name}</div>
          <div class="user-score">${this.leaderboardContents[i].score}</div>
        </div>
      `;
    }

    this.leaderboardEntries.innerHTML = htmlContent;
  }
}