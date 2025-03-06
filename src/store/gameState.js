export let currentPlayer = "X";
export let gameBoard = Array(9).fill(null);
export let subBoardStates = Array(9).fill().map(() => Array(9).fill(null));
export let selectedSubBoard = null;
export let gameOver = false;
export let timeX = 600;
export let timeO = 600;
export let timerInterval = null;

export const resetGameState = () => {
  currentPlayer = "X";
  gameBoard.fill(null);
  subBoardStates = Array(9).fill().map(() => Array(9).fill(null));
  selectedSubBoard = null;
  gameOver = false;
  timeX = 600;
  timeO = 600;
  if (timerInterval) clearInterval(timerInterval);
};