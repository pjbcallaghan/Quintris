export class Leaderboard {
  constructor() {
    // Initialize leaderboard-specific variables
    this.dotsCount = 1;
    this.loadingSpinner = document.querySelector(".loadingSpinner")
    this.leaderboardContents = [];
    this.leaderboardEntries = document.querySelector(".leaderboard-entries");
    this.leaderboard = document.querySelector(".leaderboard");
    this.leaderboardBackButton = document.querySelector(".leaderboard-back-button");
    this.submitScoreButton = document.querySelector(".js-submit-score");
    this.prevPageButton = document.getElementById("scoreboard-button-back");
    this.nextPageButton = document.getElementById("scoreboard-button-next");
    this.tabButtons = document.querySelectorAll(".leaderboard-tab");
    this.scoreSubmitted = false;
    this.score = 0;
    this.username = '';
    this.userRank;
    this.gameMode = 'Quintris';
    this.currentPage = 0;
  }

  returnToMenu() {
    this.leaderboard.style.display = 'none';
  }

  changeTab() {
    this.tabButtons.forEach((button) => {
      button.classList.remove('active-tab')
    });
  }

  async fetchLeaderboard() {
    try {
      const response = await fetch("https://web-production-83ce.up.railway.app/leaderboard");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json(); // Fetch and parse JSON data
      this.leaderboardContents = data;   // Store data in leaderboardContents
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  }

  async submitScore(name, score, mode) {
    if (this.scoreSubmitted) return;

    this.scoreSubmitted = true;
    this.submitScoreButton.innerHTML = 'Please wait...';

    const response = await fetch("https://web-production-83ce.up.railway.app/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, score, mode })
    });

    const data = await response.json();
    this.submitScoreButton.innerHTML = 'Score submitted!';
    console.log("Score submitted:", data);

    if (data.rank) {
      this.gameMode = data.mode
      this.score = data.score
      this.userRank = data.rank - 1
      this.username = data.name
    }
  }


  async viewLeaderboard(mode) {
    loadingSpinner.style.display = 'flex';
    await this.fetchLeaderboard();
    loadingSpinner.style.display = 'none';
    this.currentPage = 0;

    document.querySelectorAll(".leaderboard-tab").forEach(button => {
      if (button.innerHTML.trim() === mode) {
        button.classList.add("active-tab");
      } else {
        button.classList.remove("active-tab");
      }
    });

    this.updateLeaderboardView(mode)
    this.updateSelfEntry();
    this.leaderboard.style.display = "flex";
  }

  changePage(direction) {
    const leaderboardData = this.leaderboardContents[document.querySelector(".active-tab").innerHTML];
    const totalPages = Math.ceil(leaderboardData.length / 8);

    if (direction === "next" && this.currentPage < totalPages - 1) {
      this.currentPage += 1;
    } else if (direction === "prev" && this.currentPage > 0) {
      this.currentPage -= 1;
    } else {
      return;
    }

    this.updateLeaderboardView(document.querySelector(".active-tab").innerHTML)
  }

  updateLeaderboardView(mode) {
    const leaderboardData = this.leaderboardContents[mode];

    let htmlContent = "";
    for (let i = (this.currentPage * 8); i < (this.currentPage * 8) + 8; i++) {
      if (leaderboardData[i]) {
        //This looks horrible and needs to be refactored
        htmlContent += `
        <div class="leaderboard-entry">
          <div class="user-rank${((this.userRank - 1 === i) && (this.gameMode === document.querySelector(".active-tab").innerHTML)) ? ' self-entry-tab' : ''}">${i + 1}</div>
          <div class="user-name${((this.userRank - 1 === i) && (this.gameMode === document.querySelector(".active-tab").innerHTML)) ? ' self-entry-tab' : ''}">${leaderboardData[i].name}</div>
          <div class="user-score${((this.userRank - 1 === i) && (this.gameMode === document.querySelector(".active-tab").innerHTML)) ? ' self-entry-tab' : ''}">${leaderboardData[i].score}</div>
        </div>
      `;
      } else {
        break;
      }
    }
    this.leaderboardEntries.innerHTML = htmlContent;
    this.updateSelfEntry();
  }

  updateSelfEntry() {
    if (document.querySelector(".active-tab").innerHTML === this.gameMode) {
      if (this.userRank) {
        if (this.userRank > (this.currentPage * 8) && this.userRank <= ((this.currentPage * 8) + 8)) {
          document.querySelector(".self-entry").innerHTML = ``
        } else {
          document.querySelector(".self-entry").innerHTML = `
          <div class="leaderboard-entry">
            <div class="user-rank self-entry-tab">${this.userRank}</div>
            <div class="user-name self-entry-tab">${this.username}</div>
            <div class="user-score self-entry-tab">${this.score}</div>
          </div>
        `;
        }
      }
    } else {
      document.querySelector(".self-entry").innerHTML = ``
    }
  }

}