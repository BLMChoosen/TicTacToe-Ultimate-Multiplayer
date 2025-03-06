import { gameBoard, selectedSubBoard } from '../store/gameState';
import { updateActiveSubBoard } from '../utils/gameLogic';
import { makeMove } from '../services/gameService';

export const createSubBoards = () => {
  const mainBoard = document.getElementById("main-board");
  mainBoard.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const subBoard = document.createElement("div");
    subBoard.className = `sub-board ${gameBoard[i] ? 'taken' : ''}`;
    subBoard.id = `board-${i}`;

    for (let j = 0; j < 9; j++) {
      const cell = document.createElement("div");
      cell.className = `cell ${subBoardStates[i][j] ? 'taken' : ''}`;
      cell.id = `cell-${i}-${j}`;
      cell.textContent = subBoardStates[i][j] || '';
      cell.onclick = () => makeMove(i, j);
      subBoard.appendChild(cell);
    }

    mainBoard.appendChild(subBoard);
  }

  updateActiveSubBoard();
};