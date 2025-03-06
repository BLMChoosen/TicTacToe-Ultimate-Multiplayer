import { currentPlayer, timeX, timeO, gameOver } from '../store/gameState';
import { endGame } from './gameService';
import { formatTime } from '../utils/helpers';

export const startTimer = () => {
  const updateTimerDisplay = () => {
    document.getElementById('timer-x').textContent = `X: ${formatTime(timeX)}`;
    document.getElementById('timer-o').textContent = `O: ${formatTime(timeO)}`;
  };

  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (gameOver) return;

    currentPlayer === 'X' ? timeX-- : timeO--;
    updateTimerDisplay();

    if (timeX <= 0) endGame('O', 'Tempo esgotado para X!');
    if (timeO <= 0) endGame('X', 'Tempo esgotado para O!');
  }, 1000);
};