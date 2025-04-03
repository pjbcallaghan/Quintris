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
    this.tabButtons = document.querySelectorAll(".leaderboard-tab");
    this.scoreSubmitted = false;
    this.score = 0;
    this.username = '';
    this.userRank;
    this.gameMode = 'Quintris';
    this.currentPage = 0;
  }

  async fetchLeaderboard() {
    try {
      const response = await fetch("http://localhost:3000/leaderboard");
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
    this.submitScoreButton.innerHTML = 'Score submitted';

    const response = await fetch("http://localhost:3000/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, score, mode })
    });

    const data = await response.json();
    console.log("Score submitted:", data);

    if (data.rank) {
      this.score = data.score
      this.userRank = data.rank - 1
      this.username = data.name
    }
  }

  async viewLeaderboard(mode) {
    this.currentPage = 0;
    await this.fetchLeaderboard();

    const leaderboardData = this.leaderboardContents[mode];

    if (!leaderboardData) {
      console.error("No data found for mode:", mode);
      return;
    }

    document.querySelectorAll(".leaderboard-tab").forEach(button => {
      if (button.innerHTML.trim() === mode) {
        button.classList.add("active-tab");
      } else {
        button.classList.remove("active-tab");
      }
    });

    let htmlContent = "";
    for (let i = 0; i < 8; i++) {
      if (leaderboardData[i] !== undefined) {
        htmlContent += `
              <div class="leaderboard-entry">
                <div class="user-rank">${i + 1}</div>
                <div class="user-name">${leaderboardData[i].name}</div>
                <div class="user-score">${leaderboardData[i].score}</div>
              </div>
            `;
      } else {
        break;
      }
    }

    this.updateSelfEntry();
    this.leaderboardEntries.innerHTML = htmlContent;
    this.leaderboard.style.display = "flex";
  }

  returnToMenu() {
    this.leaderboard.style.display = 'none';
  }

  changeTab() {
    this.tabButtons.forEach((button) => {
      button.classList.remove('active-tab')
    });
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
  
    const startIdx = this.currentPage * 8;
    const endIdx = startIdx + 8;

    let htmlContent = "";
    for (let i = startIdx; i < endIdx; i++) {
      if (leaderboardData[i]) {
      htmlContent += `
        <div class="leaderboard-entry">
          <div class="user-rank">${i + 1}</div>
          <div class="user-name">${leaderboardData[i].name}</div>
          <div class="user-score">${leaderboardData[i].score}</div>
        </div>
      `;
      } else {
        break;
      }
    }
    this.updateSelfEntry();
    this.leaderboardEntries.innerHTML = htmlContent;
  }

  updateSelfEntry() {
    if (document.querySelector(".active-tab").innerHTML === this.gameMode) {
      if (this.userRank) {
        if (this.userRank > (this.currentPage * 8) && this.userRank < ((this.currentPage * 8) + 8)) {
          document.querySelector(".self-entry").innerHTML = ``
        } else {
          document.querySelector(".self-entry").innerHTML = `
          <div class="leaderboard-entry">
            <div class="user-rank">${this.userRank}</div>
            <div class="user-name">${this.username}</div>
            <div class="user-score">${this.score}</div>
          </div>
        `;
        }
      }
    } else {
      document.querySelector(".self-entry").innerHTML = ``
    }
  }

}