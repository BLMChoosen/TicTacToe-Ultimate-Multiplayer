import {
    currentPlayer, gameBoard, subBoardStates, selectedSubBoard,
    gameOver, timerInterval, resetGameState
  } from '../store/gameState.js';
  import { checkWinner, checkDraw, checkSubBoardStatus } from '../utils/gameLogic.js';
  import { startTimer } from './timerService.js';
  import { createSubBoards } from '../components/SubBoards.js';
  
  const updateGameStatus = (message) => {
    document.getElementById("status").textContent = message;
  };
  
  export const makeMove = (boardIndex, cellIndex) => {
    if (gameOver || 
        subBoardStates[boardIndex][cellIndex] || 
        gameBoard[boardIndex] ||
        (selectedSubBoard !== null && selectedSubBoard !== boardIndex)) return;
  
    subBoardStates[boardIndex][cellIndex] = currentPlayer;
    const cellElement = document.getElementById(`cell-${boardIndex}-${cellIndex}`);
    cellElement.textContent = currentPlayer;
    cellElement.classList.add('taken');
  
    const subBoardStatus = checkSubBoardStatus(boardIndex);
    if (subBoardStatus) {
      gameBoard[boardIndex] = subBoardStatus === 'draw' ? 'D' : subBoardStatus;
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
    const globalWinner = checkWinner(gameBoard);
    if (globalWinner) {
      endGame(globalWinner === 'D' ? null : globalWinner, 
             globalWinner === 'D' ? 'Jogo Empatado!' : `${globalWinner} Venceu o Jogo!`);
      return;
    }
    
    selectedSubBoard = determineNextSubBoard();
    updateGameStatus(`Vez do ${currentPlayer} (Sub-tabuleiro: ${selectedSubBoard ?? 'Livre'})`);
  };
  
  const determineNextSubBoard = () => {
    const nextBoard = selectedSubBoard !== null ? selectedSubBoard : 
                     document.querySelectorAll('.cell').id.split('-')[1];
    return gameBoard[nextBoard] ? null : nextBoard;
  };
  
  const switchPlayer = () => {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  };
  
  export const endGame = (winner, message) => {
    gameOver = true;
    clearInterval(timerInterval);
    updateGameStatus(message);
    if (winner) document.body.classList.add('global-victory');
  };
  
  export const resetGame = () => {
    resetGameState();
    document.body.classList.remove('global-victory');
    createSubBoards();
    startTimer();
    updateGameStatus("Vez do Jogador X (Escolha um sub-tabuleiro)");
  };