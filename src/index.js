import { createSubBoards } from './components/SubBoards.js';
import { startTimer, resetGame } from './services/gameService.js';

document.addEventListener('DOMContentLoaded', () => {
  createSubBoards();
  startTimer();
  document.getElementById('reset-button').addEventListener('click', resetGame);
});