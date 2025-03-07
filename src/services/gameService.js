import { gameState } from '../store/gameState.js';  // Acessando o gameState diretamente
import { checkWinner, checkDraw, checkSubBoardStatus } from '../utils/gameLogic.js';
import { startTimer } from './timerService.js';
import { createSubBoards } from '../components/SubBoards.js';

const updateGameStatus = (message) => {
  document.getElementById("status").textContent = message;
};

export const makeMove = (boardIndex, cellIndex) => {
  // Verificar se o jogo acabou ou se a célula já está ocupada
  if (
    gameState.gameOver ||
    gameState.subBoardStates[boardIndex][cellIndex] ||
    gameState.gameBoard[boardIndex] ||
    (gameState.selectedSubBoard !== null && gameState.selectedSubBoard !== boardIndex)
  ) return;

  // Realizar o movimento
  gameState.subBoardStates[boardIndex][cellIndex] = gameState.currentPlayer;
  const cellElement = document.getElementById(`cell-${boardIndex}-${cellIndex}`);
  cellElement.textContent = gameState.currentPlayer;
  cellElement.classList.add('taken');

  // Verificar o status do sub-tabuleiro
  const subBoardStatus = checkSubBoardStatus(boardIndex);
  if (subBoardStatus) {
    gameState.gameBoard[boardIndex] = subBoardStatus === 'draw' ? 'D' : subBoardStatus;
    const boardElement = document.getElementById(`board-${boardIndex}`);
    boardElement.classList.add('taken');

    const overlayText = subBoardStatus === 'draw' ? 'EMPATE!' : `${subBoardStatus} VENCEU!`;
    boardElement.innerHTML += `<div class="overlay">${overlayText}</div>`;
  }

  // Verificar status global do jogo
  checkGlobalGameStatus(cellIndex); // Passa o cellIndex para determinar o próximo sub-tabuleiro
  switchPlayer();
  startTimer();
};

const checkGlobalGameStatus = (lastCellIndex) => {
  const globalWinner = checkWinner(gameState.gameBoard);
  if (globalWinner) {
    endGame(globalWinner === 'D' ? null : globalWinner, 
           globalWinner === 'D' ? 'Jogo Empatado!' : `${globalWinner} Venceu o Jogo!`);
    return;
  }

  // Determina qual sub-tabuleiro pode ser jogado a seguir
  gameState.selectedSubBoard = determineNextSubBoard(lastCellIndex);
  updateGameStatus(`Vez do ${gameState.currentPlayer} (Sub-tabuleiro: ${gameState.selectedSubBoard ?? 'Livre'})`);
};

const determineNextSubBoard = (lastCellIndex) => {
  // Verifica se o sub-tabuleiro alvo está disponível
  const isTargetBoardAvailable = 
    gameState.gameBoard[lastCellIndex] === null && // Sub-tabuleiro não foi vencido
    !checkDraw(gameState.subBoardStates[lastCellIndex]); // Sub-tabuleiro não está cheio

  // Se o alvo estiver disponível, força o próximo jogador a ir para lá
  if (isTargetBoardAvailable) {
    return lastCellIndex;
  } else {
    // Permite escolher qualquer sub-tabuleiro disponível
    const availableBoards = gameState.gameBoard
      .map((board, index) => (board === null ? index : null))
      .filter(board => board !== null);
    return availableBoards.length > 0 ? null : null; // "null" = jogador pode escolher qualquer tabuleiro
  }
};

const switchPlayer = () => {
  // Alterna o jogador atual
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