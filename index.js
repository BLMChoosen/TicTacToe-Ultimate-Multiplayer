import { createSubBoards } from './src/components/SubBoards.js';
import {resetGame } from './src/services/gameService.js';
import { startTimer } from './src/services/timerService.js';

document.addEventListener('DOMContentLoaded', () => {
  createSubBoards();
  startTimer();
  document.getElementById('reset-button').addEventListener('click', resetGame);
}); 