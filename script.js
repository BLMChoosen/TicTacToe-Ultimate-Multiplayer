let currentPlayer = "X";
let gameBoard = Array(9).fill(null); // Estado dos sub-tabuleiros no jogo global
let subBoardStates = Array(9).fill().map(() => Array(9).fill(null)); // Estado de cada sub-tabuleiro
let selectedSubBoard = null; // Define qual sub-tabuleiro deve ser jogado
let gameOver = false;
let timeX = 600; // 10 minutos em segundos
let timeO = 600; // 10 minutos em segundos
let timerInterval = null;

// Cria os 9 sub-tabuleiros e suas células
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
createSubBoards();

// Inicia (ou reinicia) o timer, limpando o anterior se necessário
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (currentPlayer === "X") {
      timeX--;
      document.getElementById("timer-x").textContent = `Tempo restante (X): ${formatTime(timeX)}`;
      if (timeX <= 0) {
        endGame("O", "Tempo esgotado para o jogador X!");
      }
    } else {
      timeO--;
      document.getElementById("timer-o").textContent = `Tempo restante (O): ${formatTime(timeO)}`;
      if (timeO <= 0) {
        endGame("X", "Tempo esgotado para o jogador O!");
      }
    }
  }, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Verifica se há vencedor no sub-tabuleiro
function checkWinnerInSubBoard(boardIndex) {
  const subBoard = subBoardStates[boardIndex];
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (subBoard[a] && subBoard[a] === subBoard[b] && subBoard[a] === subBoard[c]) {
      return subBoard[a];
    }
  }
  return null;
}

// Verifica se o sub-tabuleiro terminou empatado
function checkDrawInSubBoard(boardIndex) {
  const subBoard = subBoardStates[boardIndex];
  return subBoard.every(cell => cell !== null) && !checkWinnerInSubBoard(boardIndex);
}

// Verifica o vencedor global utilizando os estados dos sub-tabuleiros
function checkGlobalWinner() {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
      return gameBoard[a];
    }
  }
  return null;
}

// Verifica se o jogo global empatou (todos os sub-tabuleiros decididos sem vencedor global)
function checkGlobalDraw() {
  return gameBoard.every(state => state !== null) && !checkGlobalWinner();
}

// Realiza a jogada
function makeMove(boardIndex, cellIndex) {
  if (gameOver || subBoardStates[boardIndex][cellIndex] !== null || gameBoard[boardIndex] !== null ||
      (selectedSubBoard !== null && selectedSubBoard !== boardIndex)) {
    return;
  }
  subBoardStates[boardIndex][cellIndex] = currentPlayer;
  const cellElem = document.getElementById(`cell-${boardIndex}-${cellIndex}`);
  cellElem.textContent = currentPlayer;
  cellElem.classList.add("taken");

  // Verifica vencedor ou empate no sub-tabuleiro
  const winnerSub = checkWinnerInSubBoard(boardIndex);
  if (winnerSub) {
    gameBoard[boardIndex] = winnerSub;
    const boardElem = document.getElementById(`board-${boardIndex}`);
    boardElem.classList.add("taken");
    // Cria o overlay com efeito de pulso para a vitória
    boardElem.innerHTML += `<div class="overlay victory-effect">${winnerSub} VENCEU!</div>`;
  } else if (checkDrawInSubBoard(boardIndex)) {
    gameBoard[boardIndex] = "Empate";
    const boardElem = document.getElementById(`board-${boardIndex}`);
    boardElem.classList.add("taken");
    boardElem.innerHTML += `<div class="overlay">EMPATE!</div>`;
  }

  // Verifica se há vencedor global ou empate global
  const winnerGlobal = checkGlobalWinner();
  if (winnerGlobal) {
    endGame(winnerGlobal, `Jogador ${winnerGlobal} venceu o jogo!`);
    return;
  }
  if (checkGlobalDraw()) {
    endGame(null, "O jogo empatou!");
    return;
  }

  // Determina o próximo sub-tabuleiro a ser jogado
  if (subBoardStates[cellIndex].every(cell => cell !== null) || gameBoard[cellIndex] !== null) {
    selectedSubBoard = null;
  } else {
    selectedSubBoard = cellIndex;
  }
  updateActiveSubBoard();

  // Alterna o jogador e atualiza o status
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  document.getElementById("status").textContent = `Vez do jogador ${currentPlayer} (Escolha o sub-tabuleiro ${selectedSubBoard === null ? "qualquer" : selectedSubBoard + 1})`;

  startTimer();
}

// Atualiza visualmente o sub-tabuleiro ativo
function updateActiveSubBoard() {
  document.querySelectorAll(".sub-board").forEach(board => board.classList.remove("active"));
  if (selectedSubBoard !== null) {
    document.getElementById(`board-${selectedSubBoard}`).classList.add("active");
  }
}

// Encerra o jogo, aplicando efeitos visuais na vitória global
function endGame(winner, message) {
  gameOver = true;
  clearInterval(timerInterval);
  document.getElementById("status").textContent = message;
  if (winner) {
    // Aplica efeito visual global para a vitória
    document.body.classList.add("global-victory");
  }
}

// Reinicia o jogo e reseta todas as variáveis e efeitos
function resetGame() {
  gameBoard.fill(null);
  subBoardStates = Array(9).fill().map(() => Array(9).fill(null));
  selectedSubBoard = null;
  gameOver = false;
  currentPlayer = "X";
  timeX = 600;
  timeO = 600;
  document.body.classList.remove("global-victory");
  document.getElementById("status").textContent = "Vez do jogador X (Escolha um sub-tabuleiro)";
  document.getElementById("timer-x").textContent = `Tempo restante (X): ${formatTime(timeX)}`;
  document.getElementById("timer-o").textContent = `Tempo restante (O): ${formatTime(timeO)}`;
  createSubBoards();
  startTimer();
}

startTimer()