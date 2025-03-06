import { gameBoard, subBoardStates } from '../store/gameState';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export const checkWinner = (board) => {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

export const checkDraw = (board) => board.every(cell => cell !== null);

export const checkSubBoardStatus = (boardIndex) => {
  const subBoard = subBoardStates[boardIndex];
  const winner = checkWinner(subBoard);
  if (winner) return winner;
  return checkDraw(subBoard) ? 'draw' : null;
};

export const updateActiveSubBoard = () => {
  document.querySelectorAll('.sub-board').forEach(board => 
    board.classList.remove('active'));
  
  if (selectedSubBoard !== null) {
    const activeBoard = document.getElementById(`board-${selectedSubBoard}`);
    if (activeBoard) activeBoard.classList.add('active');
  }
};