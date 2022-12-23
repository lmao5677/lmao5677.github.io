const board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
let currentPlayer = "X";
let gameStatus = "ongoing";

const setMessage = (msg) => {
  document.getElementById("message").textContent = msg;
};

const checkWin = () => {
  // check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] !== 0 && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      gameStatus = board[i][0] === 1 ? "X wins" : "O wins";
      return;
    }
  }

  // check columns
  for (let i = 0; i < 3; i++) {
    if (board[0][i] !== 0 && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
      gameStatus = board[0][i] === 1 ? "X wins" : "O wins";
      return;
    }
  }

  // check diagonals
  if (board[0][0] !== 0 && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    gameStatus = board[0][0] === 1 ? "X wins" : "O wins";
    return;
  }
  if (board[0][2] !== 0 && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    gameStatus = board[0][2] === 1 ? "X wins" : "O wins";
    return;
  }

  // check
const cells = document.getElementsByTagName("td");
for (let i = 0; i < cells.length; i++) {
  cells[i].addEventListener("click", (event) => {
    // get row and column index of the clicked cell
    const row = Math.floor(i / 3);
    const col = i % 3;

    // check if the cell is already occupied or the game is over
    if (board[row][col] !== 0 || gameStatus !== "ongoing") {
      return;
    }

    // update board, cell text, and current player
    board[row][col] = currentPlayer === "X" ? 1 : 2;
    event.target.textContent = currentPlayer;
    currentPlayer = currentPlayer === "X" ? "O" : "X";

    // check if the game is won or drawn
    checkWin();

    // update message
    if (gameStatus === "ongoing") {
      setMessage(`Player ${currentPlayer}'s turn`);
    } else {
      setMessage(gameStatus);
    }
  });
}

document.getElementById("reset-button").addEventListener("click", () => {
  // reset board and current player
  board.forEach((row) => row.fill(0));
  currentPlayer = "X";
  gameStatus = "ongoing";

  // clear cell text and message
  for (let i = 0; i < cells.length; i++) {
    cells[i].textContent = "";
  }
  setMessage("Player X's turn");
});
