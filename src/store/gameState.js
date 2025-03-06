// Alterando as variáveis para fazer parte de um único objeto, facilitando o gerenciamento
export const gameState = {
  currentPlayer: "X",
  gameBoard: Array(9).fill(null),
  subBoardStates: Array(9).fill().map(() => Array(9).fill(null)),
  selectedSubBoard: null,
  gameOver: false,
  timeX: 600,
  timeO: 600,
  timerInterval: null,

  resetGameState() {
    this.currentPlayer = "X";
    this.gameBoard.fill(null);
    this.subBoardStates = Array(9).fill().map(() => Array(9).fill(null));
    this.selectedSubBoard = null;
    this.gameOver = false;
    this.timeX = 600;
    this.timeO = 600;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
};
