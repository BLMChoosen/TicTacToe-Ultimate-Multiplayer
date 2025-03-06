let currentPlayer = "X";
let gameBoard = Array(9).fill(null);
let subBoardStates = Array(9).fill().map(() => Array(9).fill(null));
let selectedSubBoard = null;
let gameOver = false;
let timeX = 600;
let timeO = 600;
let timerInterval = null;

function createSubBoards() {
  const mainBoard = document.getElementById("main-board");
  mainBoard.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const subBoard = document.createElement("div");
    subBoard.classList.add("sub-board");
    subBoard.id = `board-${i}`;
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `cell-${i}-${j}`;
      cell.onclick = () => makeMove(i, j);
      subBoard.appendChild(cell);
    }
    mainBoard.appendChild(subBoard);
  }
  updateActiveSubBoard();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    currentPlayer === "X" ? decrementTimeX() : decrementTimeO();
  }, 1000);
}

function decrementTimeX() {
  timeX--;
  document.getElementById("timer-x").textContent = `Tempo restante (X): ${formatTime(timeX)}`;
  if (timeX <= 0) endGame("O", "Tempo esgotado para o jogador X!");
}

function decrementTimeO() {
  timeO--;
  document.getElementById("timer-o").textContent = `Tempo restante (O): ${formatTime(timeO)}`;
  if (timeO <= 0) endGame("X", "Tempo esgotado para o jogador O!");
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Funções de verificação de vitória/empate (manter implementação original)
// [As funções checkWinnerInSubBoard, checkDrawInSubBoard, checkGlobalWinner, checkGlobalDraw...]

// Funções de controle do jogo (manter implementação original)
// [As funções makeMove, updateActiveSubBoard, endGame, resetGame...]

// Inicialização do jogo
createSubBoards();
startTimer();