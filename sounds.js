export class Sounds {
  static bgMusic = document.querySelector(".bgMusic");
  static muteButton = document.querySelector(".js-mute-music")
  static lineClearSound = document.getElementById("line-clear"); 
  static gameOverSound = document.getElementById("game-over.mp3");
  static pieceDownSound = document.getElementById("piece-down");
  
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