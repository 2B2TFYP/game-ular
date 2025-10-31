// Memanggil bagian di HTML
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

// Mengatur ukuran grid
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Deklarasi variabel
let snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
let food = { x: 5, y: 5 };
let direction = 'right';
let score = 0;
let gameRunning = true;

// Fungsi menggambar game
function draw() {
  // Latar belakang
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gambar ular
  ctx.fillStyle = 'limegreen';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  // Gambar makanan
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// Fungsi update posisi ular dan logika game
function update() {
  if (!gameRunning) return;

  const head = { ...snake[0] };

  if (direction === 'up') head.y--;
  if (direction === 'down') head.y++;
  if (direction === 'left') head.x--;
  if (direction === 'right') head.x++;

  // Menabrak dinding
  if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
    endGame();
    return;
  }

  // Menabrak tubuh sendiri
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      endGame();
      return;
    }
  }

  snake.unshift(head);

  // Makan makanan
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    generateFood();
  } else {
    snake.pop();
  }
}

// Fungsi untuk membuat makanan baru
function generateFood() {
  food = {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight),
  };
}

// Mengakhiri permainan
function endGame() {
  gameRunning = false;
  gameOverElement.style.display = 'block';
}

// Reset permainan
function resetGame() {
  snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
  direction = 'right';
  score = 0;
  scoreElement.textContent = score;
  gameRunning = true;
  gameOverElement.style.display = 'none';
  generateFood();
}

// Loop utama game
function gameLoop() {
  update();
  draw();
}

// Kontrol arah dengan keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
  if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
  if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
  if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
});

// Jalankan game
resetGame();
setInterval(gameLoop, 90);