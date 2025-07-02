const gameBoard = document.getElementById('gameBoard');
const restartBtn = document.getElementById('restartBtn');

const BASE_URL = location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://connect-4-project.onrender.com';

const ROWS = 6;
const COLS = 7;

for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        gameBoard.appendChild(cell);
    }
}

let playerTurn = true;

const cells = document.querySelectorAll('#gameBoard .cell');

const topRowCells = document.querySelectorAll(`.cell[data-row='0']`);

topRowCells.forEach(cell => {
    cell.addEventListener('click', (event) => {
        if (!playerTurn) { return };
        const col = parseInt(event.target.dataset.col);
        for (let row = ROWS - 1; row >= 0; row--) {
            const cellToFill = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            if (!cellToFill.classList.contains('red') && !cellToFill.classList.contains('yellow')) {
                cellToFill.classList.add('red');
                playerTurn = false;
                botMove();
                break;
                
            }
        }
    });
});

function check_winner(x, y) {
    const cell = document.querySelector(`.cell[data-row='${x}'][data-col='${y}']`);
    if (!cell) return false;
    const color = cell.classList.contains('red') ? 'red' : cell.classList.contains('yellow') ? 'yellow' : null;
    if (!color) return false;

    const directions = [
        [0,1],  
        [1,0],  
        [1,1],  
        [1,-1] 
    ];

    for (const [dx, dy] of directions) {
        let count = 1;
        for (let step = 1; step < 4; step++) {
            const nx = x + dx * step;
            const ny = y + dy * step;
            const nextCell = document.querySelector(`.cell[data-row='${nx}'][data-col='${ny}']`);
            if (nextCell && nextCell.classList.contains(color)) count++;
                else break;
        }
        for (let step = 1; step < 4; step++) {
            const nx = x - dx * step;
            const ny = y - dy * step;
            const nextCell = document.querySelector(`.cell[data-row='${nx}'][data-col='${ny}']`);
            if (nextCell && nextCell.classList.contains(color)) count++;
                else break;
        }
        if (count >= 4) return true;
    }
    return false;
}

function botMove() {
    const board = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            if (cell.classList.contains('red')) board.push(1);
            else if (cell.classList.contains('yellow')) board.push(2);
            else board.push(0);
        }
    }

    fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board })
    })      
    .then(res => res.json())
    .then(data => {
        const col = data.move;
        for (let row = ROWS - 1; row >= 0; row--) {
            const cellToFill = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            if (!cellToFill.classList.contains('red') && !cellToFill.classList.contains('yellow')) {
                cellToFill.classList.add('yellow');
                playerTurn = true;
                break;
            }
        }
    })
    .catch(err => {
        console.error('Error from backend:', err);
        playerTurn = true; 
    });
}


restartBtn.addEventListener('click', () => {
    cells.forEach(cell => {
        cell.classList.remove('red', 'yellow');
    });
    playerTurn = true;
});



