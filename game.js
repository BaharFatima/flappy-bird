const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");

const WIDTH = 400;
const HEIGHT = 600;
const GROUND_Y = 500;

/* ---------- Bird ---------- */
const birdImg = new Image();
birdImg.src = "player.png";

let bird = {
  x: 80,
  y: HEIGHT / 2,
  size: 45,
  velocity: 0
};

// Slower physics
const GRAVITY = 0.7;
const JUMP = -6.5;

/* ---------- Pipes ---------- */
const PIPE_WIDTH = 60;
const PIPE_GAP = 190;
const PIPE_SPEED = 0.7;

let pipes = [];
let score = 0;
let gameOver = false;

/* ---------- Background ---------- */
let cloudX1 = 60, cloudX2 = 220, cloudX3 = 360;
let groundOffset = 0;

/* ---------- Helpers ---------- */
function addPipePair() {
  const h = 140 + Math.random() * 180;
  pipes.push({ x: WIDTH, y: 0, h, scored: false });
  pipes.push({ x: WIDTH, y: h + PIPE_GAP, h: HEIGHT, scored: false });
}

function resetGame() {
  pipes = [];
  score = 0;
  bird.y = HEIGHT / 2;
  bird.velocity = 0;
  gameOver = false;
  restartBtn.style.display = "none";
  addPipePair();
}

/* ---------- Controls ---------- */
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !gameOver) {
    bird.velocity = JUMP;
  }
});

restartBtn.onclick = resetGame;

/* ---------- Drawing helpers ---------- */
function drawCloud(x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.ellipse(x, y, 35, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 25, y - 18, 35, 25, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 50, y, 35, 20, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuilding(x, y, w, h) {
  ctx.fillStyle = "#4b5569";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "rgba(255,220,160,0.7)";
  for (let i = y + 12; i < y + h - 20; i += 22) {
    ctx.fillRect(x + 10, i, 10, 10);
    ctx.fillRect(x + 30, i, 10, 10);
  }

  ctx.fillStyle = "#777";
  ctx.fillRect(x + 5, y + h / 2, w - 10, 6);
}

function drawGrass() {
  ctx.strokeStyle = "#469646";
  for (let i = -groundOffset; i < WIDTH; i += 10) {
    ctx.beginPath();
    ctx.moveTo(i, GROUND_Y);
    ctx.lineTo(i + 2, GROUND_Y - 8);
    ctx.stroke();
  }
}

function drawTreesFlowers() {
  for (let i = 0; i < WIDTH; i += 90) {
    ctx.fillStyle = "#7a4b2b";
    ctx.fillRect(i + 22, GROUND_Y - 28, 8, 28);

    ctx.fillStyle = "#419650";
    ctx.beginPath();
    ctx.ellipse(i + 25, GROUND_Y - 50, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "pink";
    ctx.beginPath();
    ctx.arc(i + 60, GROUND_Y - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(i + 70, GROUND_Y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ---------- Main loop ---------- */
function update() {
  if (gameOver) return;

  // Bird physics
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  // Background movement (slower)
  cloudX1 -= 0.4;
  cloudX2 -= 0.4;
  cloudX3 -= 0.4;

  if (cloudX1 < -150) cloudX1 = WIDTH;
  if (cloudX2 < -150) cloudX2 = WIDTH + 120;
  if (cloudX3 < -150) cloudX3 = WIDTH + 240;

  groundOffset = (groundOffset + 0.4) % 10;

  // Pipes
  pipes.forEach(p => {
    p.x -= PIPE_SPEED;

    // Score when passing pipe
    if (!p.scored && p.y > 0 && p.x + PIPE_WIDTH < bird.x) {
      p.scored = true;
      score++;
    }

    // Collision
    if (
      bird.x < p.x + PIPE_WIDTH &&
      bird.x + bird.size > p.x &&
      (bird.y < p.h || bird.y + bird.size > p.y)
    ) {
      gameOver = true;
    }
  });

  // Screen bounds only
  if (bird.y < 0 || bird.y + bird.size > HEIGHT) {
    gameOver = true;
  }

  // Remove old pipes
  if (pipes[0].x + PIPE_WIDTH < 0) {
    pipes.splice(0, 2);
    addPipePair();
  }

  if (gameOver) {
    restartBtn.style.display = "block";
  }
}

function draw() {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#87cdff");
  sky.addColorStop(1, "#f0faff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Clouds
  drawCloud(cloudX1, 90);
  drawCloud(cloudX2, 150);
  drawCloud(cloudX3, 60);

  // Buildings
  for (let i = 0; i < WIDTH; i += 60) {
    const h = 90 + (i % 3) * 35;
    drawBuilding(i, GROUND_Y - h, 55, h);
  }

  // Ground
  ctx.fillStyle = "#5fb05f";
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

  drawGrass();
  drawTreesFlowers();

  // Pipes
  ctx.fillStyle = "#46aa64";
  pipes.forEach(p => ctx.fillRect(p.x, p.y, PIPE_WIDTH, p.h));

  // Bird
  ctx.drawImage(birdImg, bird.x, bird.y, bird.size, bird.size);

  // Score
  ctx.fillStyle = "white";
  ctx.font = "22px Segoe UI";
  ctx.fillText("Score: " + score, 20, 35);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "34px Segoe UI";
    ctx.fillText("GAME OVER", 85, HEIGHT / 2 - 60);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

/* ---------- Start ---------- */
addPipePair();
loop();
