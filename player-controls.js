// Handle user input
document.addEventListener('keydown', (event) => {
  if (event.key === "ArrowLeft" || event.key === "a") {
    currentTetrimino.x--;
    if (collision()) currentTetrimino.x++; // Revert if collision
  }
  if (event.key === "ArrowRight" || event.key === "d") {
    currentTetrimino.x++;
    if (collision()) currentTetrimino.x--; // Revert if collision
  }
  if (event.key === "ArrowDown" || event.key === "s") {
    currentTetrimino.y++;
    if (collision()) currentTetrimino.y--; // Revert if collision
  }
  if (event.key === "ArrowUp" || event.key === "w") {
    rotateTetrimino();
  }
  if (event.key === " ") {
    swapTetrimino();
  }


  // Redraw the game immediately after moving
  draw();
});
