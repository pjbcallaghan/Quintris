export class Sounds {
  static bgMusic = document.querySelector(".bgMusic");
  static lineClearSound = document.getElementById("line-clear");
  static gameOverSound = document.getElementById("game-over");
  static pieceDownSound = document.getElementById("piece-down");

  static muteButton = document.querySelector(".js-mute-music");

  static init() {
    this.muteButton.addEventListener("click", () => this.toggleAudio());

    // For gapless audio looping
    this.bgMusic.addEventListener('timeupdate', function () {
      let buffer = .35
      if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0
        this.play()
      }
    });
  }

  static toggleAudio() {
    if (!this.bgMusic.muted) {
      this.bgMusic.muted = true;
      this.muteButton.innerHTML = "Unmute Music"
    } else {
      this.bgMusic.muted = false;
      this.muteButton.innerHTML = "Mute Music"
    }
  }
}