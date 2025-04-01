import { Game } from "./scripts/game.js";

// Event listener for keyboard input
document.addEventListener('keydown', (event) => {
  game.handleInput(event);
});

const game = new Game();

