// Variáveis globais de configuração da IA
let maxDepth = 3;         // Profundidade máxima de busca para a IA
let aiPlayer = 'O';       // Símbolo da IA
let isAIEnabled = false;
let aiDifficulty = 'hard'; // 'easy', 'medium' ou 'hard'

let gameMode = null;      // "local" ou "ai"
let currentPlayer = "X";
let gameBoard = Array(9).fill(null); // Estado dos sub-tabuleiros no jogo global
let subBoardStates = Array(9).fill().map(() => Array(9).fill(null)); // Estado de cada sub-tabuleiro
let selectedSubBoard = null; // Define qual sub-tabuleiro deve ser jogado
let gameOver = false;
let timeX = 600;          // 10 minutos em segundos
let timeO = 600;          // 10 minutos em segundos
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

// Função que verifica um vencedor em um tabuleiro (usado pelo Minimax e avaliações)
function checkWinner(board) {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Algoritmo Minimax com poda Alpha-Beta
function minimax(depth, isMaximizing, alpha, beta, lastBoardIdx, lastCellIdx) {
  const winner = checkGlobalWinner();
  if (winner) return winner === aiPlayer ? 100 : -100;
  if (checkGlobalDraw() || depth >= maxDepth) return evaluateGameState();

  const currPlayer = isMaximizing ? aiPlayer : 'X';
  let bestScore = isMaximizing ? -Infinity : Infinity;
  const availableMoves = getNextMoves(lastCellIdx);

  for (let move of availableMoves) {
    // Simula a jogada
    subBoardStates[move.boardIdx][move.cellIdx] = currPlayer;
    // Se a jogada resulta em um sub-tabuleiro vencido, atualiza temporariamente gameBoard
    const subWinner = checkWinnerInSubBoard(move.boardIdx);
    if (subWinner) gameBoard[move.boardIdx] = subWinner;

    const score = minimax(depth + 1, !isMaximizing, alpha, beta, move.boardIdx, move.cellIdx);

    // Desfaz a jogada
    subBoardStates[move.boardIdx][move.cellIdx] = null;
    gameBoard[move.boardIdx] = null;

    if (isMaximizing) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break; // Poda Alpha-Beta
  }
  return bestScore;
}

// Função de avaliação heurística do estado global do jogo
function evaluateGameState() {
  let score = 0;
  // Avalia o tabuleiro principal
  score += evaluateGlobalBoard() * 100;
  // Avalia cada sub-tabuleiro
  for (let i = 0; i < 9; i++) {
    score += evaluateSubBoard(i) * 10;
  }
  return score;
}

function evaluateGlobalBoard() {
  const weights = [3, 2, 3, 2, 4, 2, 3, 2, 3];
  let score = 0;
  for (let i = 0; i < 9; i++) {
    if (gameBoard[i] === aiPlayer) score += weights[i];
    else if (gameBoard[i] === 'X') score -= weights[i];
  }
  return score;
}

function evaluateSubBoard(boardIdx) {
  const subBoard = subBoardStates[boardIdx];
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  let score = 0;
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    const line = [subBoard[a], subBoard[b], subBoard[c]];
    score += evaluateLine(line);
  }
  return score;
}

function evaluateLine(line) {
  let aiCount = line.filter(cell => cell === aiPlayer).length;
  let humanCount = line.filter(cell => cell === 'X').length;
  let emptyCount = 3 - (aiCount + humanCount);

  if (aiCount === 3) return 100;
  if (humanCount === 3) return -100;
  if (aiCount === 2 && emptyCount === 1) return 50;
  if (humanCount === 2 && emptyCount === 1) return -50;
  if (aiCount === 1 && emptyCount === 2) return 10;
  if (humanCount === 1 && emptyCount === 2) return -10;
  return 0;
}

// Avalia uma jogada para níveis intermediários
function evaluateMove(boardIdx, cellIdx, depth) {
  subBoardStates[boardIdx][cellIdx] = aiPlayer;
  let score = minimax(0, false, -Infinity, Infinity, boardIdx, cellIdx);
  subBoardStates[boardIdx][cellIdx] = null;
  return score;
}

// Funções para obter jogadas disponíveis de acordo com o nível de dificuldade
function getRandomMove() {
  const availableMoves = getAvailableMoves();
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getStrategicMove(depth) {
  const availableMoves = getAvailableMoves();
  let bestScore = -Infinity;
  let bestMoves = [];

  for (let move of availableMoves) {
    const score = evaluateMove(move.boardIdx, move.cellIdx, depth);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function getOptimalMove() {
  const availableMoves = getAvailableMoves();
  let bestScore = -Infinity;
  let bestMove = null;

  for (let move of availableMoves) {
    subBoardStates[move.boardIdx][move.cellIdx] = aiPlayer;
    const score = minimax(0, false, -Infinity, Infinity, move.boardIdx, move.cellIdx);
    subBoardStates[move.boardIdx][move.cellIdx] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

// Função principal da IA que escolhe a jogada conforme a dificuldade
function aiMove() {
  if (!isAIEnabled || gameOver || currentPlayer !== aiPlayer) return;

  let bestMove = null;
  switch(aiDifficulty) {
    case 'easy':
      bestMove = getRandomMove();
      break;
    case 'medium':
      bestMove = getStrategicMove(2); // Profundidade 2 para nível médio
      break;
    case 'hard':
      bestMove = getOptimalMove();    // Busca completa com Minimax
      break;
  }
  if (bestMove) {
    setTimeout(() => makeMove(bestMove.boardIdx, bestMove.cellIdx), 1000);
  }
}

// Retorna as jogadas disponíveis (no sub-tabuleiro ativo ou em todos, se não definido)
function getAvailableMoves() {
  let moves = [];
  const targetBoards = selectedSubBoard !== null ? [selectedSubBoard] : [...Array(9).keys()];
  for (let boardIdx of targetBoards) {
    if (gameBoard[boardIdx]) continue;
    for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
      if (!subBoardStates[boardIdx][cellIdx]) {
        moves.push({ boardIdx, cellIdx });
      }
    }
  }
  return moves;
}

// Retorna as próximas jogadas com base na última célula jogada
function getNextMoves(lastCellIdx) {
  // Se o sub-tabuleiro correspondente à última célula já estiver decidido, permite qualquer jogada
  const nextBoard = (gameBoard[lastCellIdx] === null) ? lastCellIdx : null;
  return nextBoard !== null ? getMovesForBoard(nextBoard) : getAvailableMoves();
}

function getMovesForBoard(boardIdx) {
  let moves = [];
  if (gameBoard[boardIdx]) return moves;
  for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
    if (!subBoardStates[boardIdx][cellIdx]) {
      moves.push({ boardIdx, cellIdx });
    }
  }
  return moves;
}

// Verifica o vencedor de um sub-tabuleiro utilizando checkWinner()
function checkWinnerInSubBoard(boardIndex) {
  const subBoard = subBoardStates[boardIndex];
  return checkWinner(subBoard);
}

// Verifica se um sub-tabuleiro empatou
function checkDrawInSubBoard(boardIndex) {
  const subBoard = subBoardStates[boardIndex];
  return subBoard.every(cell => cell !== null) && !checkWinner(subBoard);
}

// Verifica o vencedor global com base nos sub-tabuleiros concluídos
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

// Verifica se o jogo global empatou
function checkGlobalDraw() {
  return gameBoard.every(state => state !== null) && !checkGlobalWinner();
}

// Realiza a jogada do jogador atual
function makeMove(boardIdx, cellIdx) {
  if (
    gameOver ||
    subBoardStates[boardIdx][cellIdx] !== null ||
    gameBoard[boardIdx] !== null ||
    (selectedSubBoard !== null && selectedSubBoard !== boardIdx)
  ) {
    return;
  }
  subBoardStates[boardIdx][cellIdx] = currentPlayer;
  const cellElem = document.getElementById(`cell-${boardIdx}-${cellIdx}`);
  cellElem.textContent = currentPlayer;
  cellElem.classList.add("taken");

  // Verifica se o sub-tabuleiro foi vencido ou empatado
  const winnerSub = checkWinnerInSubBoard(boardIdx);
  if (winnerSub) {
    gameBoard[boardIdx] = winnerSub;
    const boardElem = document.getElementById(`board-${boardIdx}`);
    boardElem.classList.add("taken");
    boardElem.innerHTML += `<div class="overlay victory-effect">${winnerSub} VENCEU!</div>`;
  } else if (checkDrawInSubBoard(boardIdx)) {
    gameBoard[boardIdx] = "Empate";
    const boardElem = document.getElementById(`board-${boardIdx}`);
    boardElem.classList.add("taken");
    boardElem.innerHTML += `<div class="overlay">EMPATE!</div>`;
  }

  // Verifica vencedor global ou empate
  const winnerGlobal = checkGlobalWinner();
  if (winnerGlobal) {
    endGame(winnerGlobal, `Jogador ${winnerGlobal} venceu o jogo!`);
    return;
  }
  if (checkGlobalDraw()) {
    endGame(null, "O jogo empatou!");
    return;
  }

  // Define o próximo sub-tabuleiro com base na célula jogada
  if (subBoardStates[cellIdx].every(cell => cell !== null) || gameBoard[cellIdx] !== null) {
    selectedSubBoard = null;
  } else {
    selectedSubBoard = cellIdx;
  }
  updateActiveSubBoard();

  // Alterna o jogador e atualiza o status
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  document.getElementById("status").textContent =
    `Vez do jogador ${currentPlayer} (Escolha o sub-tabuleiro ${selectedSubBoard === null ? "qualquer" : selectedSubBoard + 1})`;

  startTimer();

  // Se estiver no modo VS IA e for a vez da IA, chama a função de IA
  if (gameMode === "ai" && currentPlayer === aiPlayer && !gameOver) {
    aiMove();
  }
}

// Atualiza visualmente o sub-tabuleiro ativo
function updateActiveSubBoard() {
  document.querySelectorAll(".sub-board").forEach(board =>
    board.classList.remove("active")
  );
  if (selectedSubBoard !== null) {
    document.getElementById(`board-${selectedSubBoard}`).classList.add("active");
  }
}

// Encerra o jogo e aplica efeitos visuais
function endGame(winner, message) {
  gameOver = true;
  clearInterval(timerInterval);
  document.getElementById("status").textContent = message;
  if (winner) {
    document.body.classList.add("global-victory");
  }
}

// Reinicia o jogo e reseta todas as variáveis
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

// Eventos para escolha de modo na tela inicial
document.getElementById("multiplayer-btn").addEventListener("click", function () {
  alert("Modo Multiplayer em breve!");
});
document.getElementById("vs-local-btn").addEventListener("click", function () {
  gameMode = "local";
  isAIEnabled = false;
  document.getElementById("landing").style.display = "none";
  document.getElementById("game").style.display = "block";
  resetGame();
});
document.getElementById("vs-ai-btn").addEventListener("click", function () {
  gameMode = "ai";
  isAIEnabled = true;
  document.getElementById("landing").style.display = "none";
  document.getElementById("game").style.display = "block";
  resetGame();
});

startTimer();
