export class Sounds {
  static bgMusic = document.querySelector(".bgMusic");
  static lineClearSound = document.getElementById("line-clear");
  static gameOverSound = document.getElementById("game-over");
  static pieceDownSound = document.getElementById("piece-down");

  static muteButton = document.querySelector(".js-mute-music");
  static muteSounds = document.querySelector(".js-mute-sounds");

  static init() {
    this.muteButton.addEventListener("click", () => this.toggleMusic());
    this.muteSounds.addEventListener("click", () => this.toggleSounds());

    // For gapless audio looping
    this.bgMusic.addEventListener('timeupdate', function () {
      let buffer = .35
      if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0
        this.play()
      }
    });
  }

  static toggleMusic() {
    if (!this.bgMusic.muted) {
      this.bgMusic.muted = true;
      this.muteButton.innerHTML = "Unmute Music"
    } else {
      this.bgMusic.muted = false;
      this.muteButton.innerHTML = "Mute Music"
    }
  }

  static toggleSounds() {
    if (!this.lineClearSound.muted) {
      this.lineClearSound.muted = true;
      this.gameOverSound.muted = true;
      this.pieceDownSound.muted = true;
      this.muteSounds.innerHTML = "Unmute Sounds"
    } else {
      this.lineClearSound.muted = false;
      this.gameOverSound.muted = false;
      this.pieceDownSound.muted = false;
      this.muteSounds.innerHTML = "Mute Sounds"
    }
  }

}