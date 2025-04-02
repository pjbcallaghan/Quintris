import { Game } from "./scripts/game.js";

const game = new Game();

document.addEventListener('keydown', (event) => {
  game.handleInput(event);
});


