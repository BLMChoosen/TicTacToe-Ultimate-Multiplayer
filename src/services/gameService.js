import { gameState } from '../store/gameState.js';  // Acessando o gameState diretamente
import { checkWinner, checkDraw, checkSubBoardStatus } from '../utils/gameLogic.js';
import { startTimer } from './timerService.js';
import { createSubBoards } from '../components/SubBoards.js';

const updateGameStatus = (message) => {
  document.getElementById("status").textContent = message;
};

export const makeMove = (boardIndex, cellIndex) => {
  if (
    gameState.gameOver || 
    gameState.subBoardStates[boardIndex][cellIndex] || 
    gameState.gameBoard[boardIndex] ||
    (gameState.selectedSubBoard !== null && gameState.selectedSubBoard !== boardIndex)
  ) return;

  gameState.subBoardStates[boardIndex][cellIndex] = gameState.currentPlayer;
  const cellElement = document.getElementById(`cell-${boardIndex}-${cellIndex}`);
  cellElement.textContent = gameState.currentPlayer;
  cellElement.classList.add('taken');

  const subBoardStatus = checkSubBoardStatus(boardIndex);
  if (subBoardStatus) {
    gameState.gameBoard[boardIndex] = subBoardStatus === 'draw' ? 'D' : subBoardStatus;
    const boardElement = document.getElementById(`board-${boardIndex}`);
    boardElement.classList.add('taken');

    const overlayText = subBoardStatus === 'draw' ? 'EMPATE!' : `${subBoardStatus} VENCEU!`;
    boardElement.innerHTML += `<div class="overlay">${overlayText}</div>`;
  }

  checkGlobalGameStatus();
  switchPlayer();
  startTimer();
};

const checkGlobalGameStatus = () => {
  const globalWinner = checkWinner(gameState.gameBoard);
  if (globalWinner) {
    endGame(globalWinner === 'D' ? null : globalWinner, 
           globalWinner === 'D' ? 'Jogo Empatado!' : `${globalWinner} Venceu o Jogo!`);
    return;
  }
  
  gameState.selectedSubBoard = determineNextSubBoard();
  updateGameStatus(`Vez do ${gameState.currentPlayer} (Sub-tabuleiro: ${gameState.selectedSubBoard ?? 'Livre'})`);
};

const determineNextSubBoard = () => {
  // Pegando o primeiro elemento com a classe "cell"
  const nextBoard = gameState.selectedSubBoard !== null ? gameState.selectedSubBoard : 
                    document.querySelector('.cell')?.id.split('-')[1]; // ?. garante que o código não quebre se não encontrar a célula.
  return gameState.gameBoard[nextBoard] ? null : nextBoard;
};

const switchPlayer = () => {
  gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
};

export const endGame = (winner, message) => {
  gameState.gameOver = true;
  clearInterval(gameState.timerInterval);
  updateGameStatus(message);
  if (winner) document.body.classList.add('global-victory');
};

export const resetGame = () => {
  gameState.resetGameState();  // Acessando o método dentro de gameState
  document.body.classList.remove('global-victory');
  createSubBoards();
  startTimer();
  updateGameStatus("Vez do Jogador X (Escolha um sub-tabuleiro)");
};
