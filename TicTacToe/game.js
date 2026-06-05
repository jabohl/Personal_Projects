// Game state
let currPlayer = 'X'; // Player X always starts
let board = ['', '', '', '', '', '', '', '', '']; // 3x3 game board
let active = true;
let stats = {
    xWins: 0,
    oWins: 0,
    draws: 0
};

// Winning combinations
const winScenario = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Left-to-right diagonal
    [2, 4, 6]  // Right-to-left diagonal
];

// Get all cells
const cells = document.querySelectorAll('.cell');

// Initialize event listeners
cells.forEach(cell => {
    cell.addEventListener('click', cellClicked, false);
});

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetGame, false);

/**
 * Handle player's turn
 * @param {number} cell - Index of the cell (0-8)
 */
function handlePlayerTurn(cell) {
    if (board[cell] !== '' || !active) {
        return;
    }
    board[cell] = currPlayer;
    checkForWinOrDraw();
    if (active) {
        currPlayer = currPlayer === 'X' ? 'O' : 'X';
    }
}

/**
 * Handle cell click event
 * @param {Event} cellEvent - Click event
 */
function cellClicked(cellEvent) {
    const clickedCell = cellEvent.target;
    const cell = parseInt(clickedCell.id.replace('cell-', '')) - 1;
    
    if (board[cell] !== '' || !active) {
        return;
    }
    
    handlePlayerTurn(cell);
    updateUI();
}

/**
 * Update the UI to reflect current board state
 */
function updateUI() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = board[i];
        cells[i].classList.remove('x', 'o');
        if (board[i] === 'X') {
            cells[i].classList.add('x');
        } else if (board[i] === 'O') {
            cells[i].classList.add('o');
        }
    }
    
    // Update current player display
    if (active) {
        document.getElementById('playerSymbol').innerText = currPlayer;
    }
}

/**
 * Announce the winner
 * @param {string} player - Winning player ('X' or 'O')
 */
function announceWinner(player) {
    const message = document.getElementById('gameMessage');
    message.innerText = `🎉 Player ${player} Wins! 🎉`;
    
    // Update stats
    if (player === 'X') {
        stats.xWins++;
    } else {
        stats.oWins++;
    }
    updateStats();
}

/**
 * Announce a draw
 */
function announceDraw() {
    const message = document.getElementById('gameMessage');
    message.innerText = '🤝 Game Draw! 🤝';
    
    // Update stats
    stats.draws++;
    updateStats();
}

/**
 * Check for win or draw condition
 */
function checkForWinOrDraw() {
    let won = false;

    // Check for win
    for (let i = 0; i < winScenario.length; i++) {
        const [a, b, c] = winScenario[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            won = true;
            break;
        }
    }

    if (won) {
        announceWinner(currPlayer);
        active = false;
        return;
    }

    // Check for draw
    let draw = !board.includes('');
    if (draw) {
        announceDraw();
        active = false;
        return;
    }
}

/**
 * Update statistics display
 */
function updateStats() {
    document.getElementById('xWins').innerText = stats.xWins;
    document.getElementById('oWins').innerText = stats.oWins;
    document.getElementById('draws').innerText = stats.draws;
}

/**
 * Reset the game
 */
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    active = true;
    currPlayer = 'X';
    document.getElementById('gameMessage').innerText = '';
    document.getElementById('playerSymbol').innerText = 'X';
    
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o');
    });
}

// Initialize the game on page load
window.addEventListener('DOMContentLoaded', () => {
    updateUI();
    updateStats();
});