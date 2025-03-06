import { createSubBoards } from './components/SubBoards';
import { startTimer, resetGame } from './services/gameService';

document.addEventListener('DOMContentLoaded', () => {
  createSubBoards();
  startTimer();
  document.getElementById('reset-button').addEventListener('click', resetGame);
});