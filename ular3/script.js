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
let direction = null; // Ular diam di awal
let isMoving = false; // Mulai bergerak setelah input
let score = 0;
let gameRunning = true;
let foodAnimationFrame = 0;
let gameSpeed = 200; // Kecepatan awal (dalam milidetik)

// Tambahkan variabel untuk status pause
let isPaused = false;

// Tambahkan elemen audio untuk musik latar
const backgroundMusic = new Audio('./sounds/xyz.mp3');
backgroundMusic.loop = true; // Musik akan diputar terus-menerus

// Ambil elemen video dari HTML
const backgroundVideo = document.getElementById('backgroundVideo');

// Fungsi untuk menghitung warna berdasarkan urutan balok
function getColorByIndex(index, totalSegments) {
    const normalizedIndex = index / totalSegments;
    const r = Math.floor(255 * normalizedIndex);
    const g = Math.floor(255 * (1 - normalizedIndex));
    const b = Math.floor(255 * (1 - normalizedIndex));
    return `rgb(${r}, ${g}, ${b})`;
}

// Fungsi menggambar tekstur ular dengan bentuk bulat
function drawSnakeTexture(x, y, size, color) {
    ctx.fillStyle = color;

    // Hitung pusat lingkaran
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2;

    // Gambar lingkaran
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Tambahkan garis-garis untuk tekstur
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Warna garis (gelap transparan)
    ctx.lineWidth = 2;

    // Gambar garis horizontal untuk tekstur
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY - size / 4);
    ctx.lineTo(centerX + radius, centerY - size / 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY + size / 4);
    ctx.lineTo(centerX + radius, centerY + size / 4);
    ctx.stroke();
}

// Fungsi menggambar grid transparan
function drawTransparentGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Warna garis grid (putih transparan)
    ctx.lineWidth = 1;

    // Gambar garis vertikal
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Gambar garis horizontal
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Modifikasi fungsi draw untuk memanggil drawTransparentGrid
function draw() {
    // Bersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar grid transparan
    drawTransparentGrid();

    // Gambar ular
    snake.forEach((segment, index) => {
        // Jika skor masih 0, gunakan warna biru untuk semua balok
        const color = score === 0 ? 'blue' : getColorByIndex(index, snake.length - 1);

        // Hitung ukuran balok berdasarkan panjang tubuh ular
        let segmentSize = gridSize - 2; // Ukuran default
        if (index > 0) {
            const maxShrinkLevel = 10; // Level di mana ekor mencapai ukuran minimum
            const shrinkFactor = Math.min(index / maxShrinkLevel, 1); // Faktor pengecilan (0 hingga 1)
            segmentSize = Math.max(gridSize - 2 - shrinkFactor * (gridSize / 2), gridSize / 4); // Ukuran minimum adalah 1/4 dari gridSize
        }

        // Hitung posisi balok untuk menjaga pusat tetap sejajar
        const offset = (gridSize - segmentSize) / 2;
        drawSnakeTexture(
            segment.x * gridSize + offset,
            segment.y * gridSize + offset,
            segmentSize,
            color
        );

        // Tambahkan indikator level di atas setiap balok
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Hitung angka indikator (angka terbesar di kepala)
        const levelIndicator = snake.length - index;
        ctx.fillText(`x${levelIndicator}`, segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2);
    });

    // Gambar makanan dengan animasi
    ctx.fillStyle = `rgb(255, ${100 + Math.sin(foodAnimationFrame) * 50}, ${100 + Math.sin(foodAnimationFrame) * 50})`;
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// Fungsi update posisi ular dan logika game
function update() {
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
        increaseSpeed(); // Tingkatkan kecepatan setiap kali makan
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

// Fungsi untuk meningkatkan kecepatan permainan
function increaseSpeed() {
    if (gameSpeed > 50) {
        gameSpeed -= 10;
    }
}

// Mengakhiri permainan
function endGame() {
    gameRunning = false;
    gameOverElement.textContent = "Game Over!";
    gameOverElement.style.display = 'block';
    backgroundMusic.pause(); // Hentikan musik saat permainan berakhir
}

// Reset permainan
function resetGame() {
    snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
    direction = null;
    isMoving = false;
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
    gameOverElement.style.display = 'none';
    gameSpeed = 200;
    generateFood();

    // Restart audio
    backgroundMusic.currentTime = 0; // Atur ulang audio ke awal
    backgroundMusic.play(); // Mulai audio

    // Restart video
    backgroundVideo.currentTime = 0; // Atur ulang video ke awal
    backgroundVideo.play(); // Mulai video
}

// Fungsi untuk toggle pause
function togglePause() {
    if (!gameRunning) return; // Jangan izinkan pause jika game sudah berakhir
    isPaused = !isPaused;
    if (isPaused) {
        gameOverElement.textContent = "Paused"; // Tampilkan teks "Paused"
        gameOverElement.style.display = 'block';
        backgroundMusic.pause(); // Jeda musik saat permainan dijeda
    } else {
        gameOverElement.style.display = 'none'; // Sembunyikan teks "Paused"
        backgroundMusic.play(); // Lanjutkan musik saat permainan dilanjutkan
    }
}

// Loop utama game menggunakan setInterval
function gameLoop() {
    if (gameRunning && isMoving && !isPaused) {
        update();
    }
    draw();
    foodAnimationFrame += 0.1;
}

// Kontrol arah dengan keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && direction !== 'down') { direction = 'up'; isMoving = true; }
    if (e.key === 'ArrowDown' && direction !== 'up') { direction = 'down'; isMoving = true; }
    if (e.key === 'ArrowLeft' && direction !== 'right') { direction = 'left'; isMoving = true; }
    if (e.key === 'ArrowRight' && direction !== 'left') { direction = 'right'; isMoving = true; }
    if (e.key === 'p' || e.key === 'P' || e.code === 'Space') { // Tambahkan tombol spasi untuk pause/unpause
        togglePause();
    }
});

// Jalankan game
resetGame();
setInterval(gameLoop, gameSpeed);