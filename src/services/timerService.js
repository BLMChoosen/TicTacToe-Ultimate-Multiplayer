import { gameState } from '../store/gameState.js';  // Importa o objeto inteiro
import { endGame } from './gameService.js';
import { formatTime } from '../utils/helpers.js';

export const startTimer = () => {
  const updateTimerDisplay = () => {
    document.getElementById('timer-x').textContent = `X: ${formatTime(gameState.timeX)}`;
    document.getElementById('timer-o').textContent = `O: ${formatTime(gameState.timeO)}`;
  };

  if (gameState.timerInterval) clearInterval(gameState.timerInterval);  // Usando o timerInterval do gameState

  gameState.timerInterval = setInterval(() => {
    if (gameState.gameOver) return;

    gameState.currentPlayer === 'X' ? gameState.timeX-- : gameState.timeO--;  // Atualizando as variáveis no gameState
    updateTimerDisplay();

    if (gameState.timeX <= 0) endGame('O', 'Tempo esgotado para X!');
    if (gameState.timeO <= 0) endGame('X', 'Tempo esgotado para O!');
  }, 1000);
};
