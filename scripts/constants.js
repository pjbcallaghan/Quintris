// Canvases and contexts
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const subCanvas = document.getElementById('hold-menu');
export const subCtx = subCanvas.getContext('2d');

// Constants
export const cols = 10;
export const rows = 20;
export const blockSize = 30;
export const colors = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD633', '#00d5ff',
  '#9B33FF', '#a60000', '#19a600', '#0007d9',
];
