import { Game } from "./scripts/game.js";

const game = new Game();
window.game = game;
document.addEventListener('keydown', (event) => {
  game.handleInput(event);
});


