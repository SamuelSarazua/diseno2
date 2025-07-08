// Configuración inicial
const boardSize = 10; // Cambia a un tablero de 10x10
const board = [];
let currentPlayer = 1;
const playerPositions = {
  1: { x: 0, y: 0 }, // Jugador 1 empieza en la esquina superior izquierda
  2: { x: boardSize - 1, y: boardSize - 1 } // Jugador 2 empieza en la esquina inferior derecha
};
const bombs = []; // Lista de bombas
const obstacles = [];
const numberOfObstacles = 15; // Número de obstáculos que deseas agregar

while (obstacles.length < numberOfObstacles) {
  const randomX = Math.floor(Math.random() * boardSize);
  const randomY = Math.floor(Math.random() * boardSize);

  // Evitar colocar obstáculos en las posiciones iniciales de los jugadores
  if (
    (randomX === playerPositions[1].x && randomY === playerPositions[1].y) ||
    (randomX === playerPositions[2].x && randomY === playerPositions[2].y)
  ) {
    continue;
  }

  // Evitar duplicados
  if (!obstacles.some(obstacle => obstacle.x === randomX && obstacle.y === randomY)) {
    obstacles.push({ x: randomX, y: randomY });
  }
}

// Crear el tablero
const gameBoard = document.getElementById('game-board');
for (let y = 0; y < boardSize; y++) {
  const row = [];
  for (let x = 0; x < boardSize; x++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.x = x;
    cell.dataset.y = y;
    gameBoard.appendChild(cell);
    row.push(cell);
  }
  board.push(row);
}

// Actualizar el tablero
function updateBoard() {
  // Limpiar el tablero
  board.forEach(row => row.forEach(cell => {
    cell.classList.remove('player1', 'player2', 'bomb', 'explosion', 'obstacle');
  }));

  // Dibujar las posiciones de los jugadores
  const player1Pos = playerPositions[1];
  const player2Pos = playerPositions[2];
  board[player1Pos.y][player1Pos.x].classList.add('player1');
  board[player2Pos.y][player2Pos.x].classList.add('player2');

  // Dibujar las bombas
  bombs.forEach(bomb => {
    board[bomb.y][bomb.x].classList.add('bomb');
  });

  // Dibujar los obstáculos
  obstacles.forEach(obstacle => {
    board[obstacle.y][obstacle.x].classList.add('obstacle');
  });
}

// Cambiar turno
function changeTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  document.getElementById('turn-indicator').textContent = `Turno de: Jugador ${currentPlayer}`;
}

// Mover jugador
function movePlayer(player, direction) {
  const pos = playerPositions[player];
  if (direction === 'up' && pos.y > 0) pos.y--;
  if (direction === 'down' && pos.y < boardSize - 1) pos.y++;
  if (direction === 'left' && pos.x > 0) pos.x--;
  if (direction === 'right' && pos.x < boardSize - 1) pos.x++;
  updateBoard();
  changeTurn();
}

// Colocar una bomba
function placeBomb(player) {
  const pos = playerPositions[player];
  bombs.push({ x: pos.x, y: pos.y, timer: 3 }); // La bomba explota en 3 segundos
  updateBoard();

  // Temporizador para la explosión
  setTimeout(() => {
    explodeBomb(pos.x, pos.y);
  }, 3000);
}

// Explosión de la bomba
function explodeBomb(x, y) {
  const explosionRange = 1; // Rango de la explosión
  const affectedCells = [];

  // Agregar celdas afectadas por la explosión
  for (let i = -explosionRange; i <= explosionRange; i++) {
    if (y + i >= 0 && y + i < boardSize) affectedCells.push({ x, y: y + i });
    if (x + i >= 0 && x + i < boardSize) affectedCells.push({ x: x + i, y });
  }

  // Dibujar la explosión
  affectedCells.forEach(cell => {
    if (!obstacles.some(obstacle => obstacle.x === cell.x && obstacle.y === cell.y)) {
      board[cell.y][cell.x].classList.add('explosion');
    }
  });

  // Verificar si algún jugador fue alcanzado
  affectedCells.forEach(cell => {
    if (playerPositions[1].x === cell.x && playerPositions[1].y === cell.y) {
      alert('Jugador 2 gana!');
      resetGame();
    }
    if (playerPositions[2].x === cell.x && playerPositions[2].y === cell.y) {
      alert('Jugador 1 gana!');
      resetGame();
    }
  });

  // Eliminar la bomba del tablero
  const bombIndex = bombs.findIndex(bomb => bomb.x === x && bomb.y === y);
  if (bombIndex !== -1) bombs.splice(bombIndex, 1);

  // Limpiar la explosión después de un tiempo
  setTimeout(() => {
    affectedCells.forEach(cell => {
      board[cell.y][cell.x].classList.remove('explosion');
    });
    updateBoard();
  }, 500);
}

// Reiniciar el juego
function resetGame() {
  playerPositions[1] = { x: 0, y: 0 };
  playerPositions[2] = { x: boardSize - 1, y: boardSize - 1 };
  bombs.length = 0;
  updateBoard();
}

// Manejar teclas
window.addEventListener('keydown', (e) => {
  if (currentPlayer === 1) {
    if (e.key === 'w') movePlayer(1, 'up');
    if (e.key === 's') movePlayer(1, 'down');
    if (e.key === 'a') movePlayer(1, 'left');
    if (e.key === 'd') movePlayer(1, 'right');
    if (e.key === ' ') placeBomb(1); // Espacio para colocar bomba
  } else if (currentPlayer === 2) {
    if (e.key === 'ArrowUp') movePlayer(2, 'up');
    if (e.key === 'ArrowDown') movePlayer(2, 'down');
    if (e.key === 'ArrowLeft') movePlayer(2, 'left');
    if (e.key === 'ArrowRight') movePlayer(2, 'right');
    if (e.key === 'Enter') placeBomb(2); // Enter para colocar bomba
  }
});

// Inicializar el juego
updateBoard();