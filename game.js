class Game2048 {
  constructor(boardSize = 4) {
    this.boardSize = boardSize;
    this.board = [];
    this.score = 0;
    this.gameBoard = document.getElementById("game-board");
    this.scoreDisplay = document.getElementById("score");
    this.newGameBtn = document.getElementById("new-game-btn");

    this.newGameBtn.addEventListener("click", () => this.initGame());
    document.addEventListener("keydown", this.handleKeyPress.bind(this));

    // Add touch event listeners
    this.gameBoard.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.gameBoard.addEventListener("touchend", this.handleTouchEnd.bind(this));
    this.touchStartX = null;
    this.touchStartY = null;

    this.initGame();
  }

  initGame() {
    this.board = Array.from({ length: this.boardSize }, () =>
      Array(this.boardSize).fill(0)
    );
    this.score = 0;
    this.scoreDisplay.textContent = this.score;
    this.generateTile();
    this.generateTile();
    this.renderBoard();
  }

  generateTile() {
    const emptyCells = [];
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { r, c } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  renderBoard() {
    this.gameBoard.innerHTML = "";
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const tileValue = this.board[r][c];
        const tileElement = document.createElement("div");
        tileElement.classList.add("tile");

        if (tileValue !== 0) {
          tileElement.textContent = tileValue;
          tileElement.classList.add(`tile-${tileValue}`);
        }

        this.gameBoard.appendChild(tileElement);
      }
    }
  }

  handleKeyPress(event) {
    const key = event.key;
    let moved = false;

    switch (key) {
      case "ArrowUp":
        moved = this.moveUp();
        break;
      case "ArrowDown":
        moved = this.moveDown();
        break;
      case "ArrowLeft":
        moved = this.moveLeft();
        break;
      case "ArrowRight":
        moved = this.moveRight();
        break;
      default:
        return;
    }

    if (moved) {
      this.generateTile();
      this.renderBoard();
      this.checkGameStatus();
    }
  }

  moveLeft() {
    let moved = false;
    for (let r = 0; r < this.boardSize; r++) {
      const row = this.board[r];
      const newRow = row.filter((val) => val !== 0);

      for (let c = 0; c < newRow.length - 1; c++) {
        if (newRow[c] === newRow[c + 1]) {
          newRow[c] *= 2;
          this.score += newRow[c];
          newRow.splice(c + 1, 1);
          moved = true;
        }
      }

      while (newRow.length < this.boardSize) {
        newRow.push(0);
      }

      if (JSON.stringify(row) !== JSON.stringify(newRow)) {
        moved = true;
      }
      this.board[r] = newRow;
    }
    this.scoreDisplay.textContent = this.score;
    return moved;
  }

  moveRight() {
    for (let r = 0; r < this.boardSize; r++) {
      this.board[r].reverse();
    }
    const moved = this.moveLeft();
    for (let r = 0; r < this.boardSize; r++) {
      this.board[r].reverse();
    }
    return moved;
  }

  moveUp() {
    let moved = false;
    for (let c = 0; c < this.boardSize; c++) {
      const column = this.board.map((row) => row[c]);
      const newColumn = column.filter((val) => val !== 0);

      for (let r = 0; r < newColumn.length - 1; r++) {
        if (newColumn[r] === newColumn[r + 1]) {
          newColumn[r] *= 2;
          this.score += newColumn[r];
          newColumn.splice(r + 1, 1);
          moved = true;
        }
      }

      while (newColumn.length < this.boardSize) {
        newColumn.push(0);
      }

      if (JSON.stringify(column) !== JSON.stringify(newColumn)) {
        moved = true;
      }

      for (let r = 0; r < this.boardSize; r++) {
        this.board[r][c] = newColumn[r];
      }
    }
    this.scoreDisplay.textContent = this.score;
    return moved;
  }

  moveDown() {
    this.board.reverse();
    const moved = this.moveUp();
    this.board.reverse();
    return moved;
  }

  checkGameStatus() {
    // Check for 2048 win condition
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c] === 2048) {
          alert("Congratulations! You won!");
          this.initGame();
          return;
        }
      }
    }

    // Check if board is full
    const hasEmptyCell = this.board.some((row) => row.includes(0));
    if (!hasEmptyCell) {
      // Check if any moves are possible
      const canMove = this.checkPossibleMoves();
      if (!canMove) {
        alert("Game Over! No more moves possible.");
        this.initGame();
      }
    }
  }

  checkPossibleMoves() {
    // Check if any adjacent tiles can be merged
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const current = this.board[r][c];

        // Check right
        if (c < this.boardSize - 1 && current === this.board[r][c + 1])
          return true;

        // Check down
        if (r < this.boardSize - 1 && current === this.board[r + 1][c])
          return true;
      }
    }
    return false;
  }

  handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  handleTouchEnd(event) {
    event.preventDefault();
    if (!this.touchStartX || !this.touchStartY) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    // Reset touch coordinates
    this.touchStartX = null;
    this.touchStartY = null;

    // Minimum swipe distance to trigger a move
    const minSwipeDistance = 30;

    let moved = false;

    // Determine swipe direction based on which delta is larger
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          moved = this.moveRight();
        } else {
          moved = this.moveLeft();
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          moved = this.moveDown();
        } else {
          moved = this.moveUp();
        }
      }
    }

    if (moved) {
      this.generateTile();
      this.renderBoard();
      this.checkGameStatus();
    }
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new Game2048();
});
