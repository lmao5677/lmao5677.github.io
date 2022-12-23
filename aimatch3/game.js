function generateBoard() {
  // Get the table element
  var board = document.getElementById("board");

  // Create an array of colors
  var colors = ["red", "yellow", "blue", "green"];

  // Loop through the rows and cells of the table
  for (var i = 0; i < board.rows.length; i++) {
    var row = board.rows[i];
    for (var j = 0; j < row.cells.length; j++) {
      // Assign a random color to the cell
      var color = colors[Math.floor(Math.random() * colors.length)];
      row.cells[j].className = color;
    }
  }
}

function handleMove(event) {
  // Get the clicked cell
  var cell = event.target;

  // Get the row and column of the cell
  var row = cell.parentNode.rowIndex;
  var col = cell.cellIndex;

  // Get the color of the cell
  var color = cell.className;
  // Check if there are any matching cells in the same row
  var matchingCells = [];
  for (var i = 0; i < cell.parentNode.cells.length; i++) {
  if (cell.parentNode.cells[i].className == color) {
  matchingCells.push(cell.parentNode.cells[i]);
  }
  }

  // Check if there are any matching cells in the same column
  var table = cell.parentNode.parentNode;
  for (var i = 0; i < table.rows.length; i++) {
    if (table.rows[i].cells[col].className == color) {
      matchingCells.push(table.rows[i].cells[col]);
    }
  }

  // If there are at least 2 matching cells, remove them from the board
  if (matchingCells.length >= 2) {
     for (var i = 0; i < matchingCells.length; i++) {
        matchingCells[i].className = "";
      }
    }
  }

// Generate the initial board
generateBoard();
console.log("Board Generated!");

// Attach an event listener to the table element to listen for clicks
document.getElementById("board").addEventListener("click", handleMove);
