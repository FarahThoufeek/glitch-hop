/* ==============================
     CANVAS + ELEMENTS
============================== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const glitchOverlay = document.getElementById("glitch-overlay");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

/* ==============================
      LOAD IMAGES
============================== */
const rocketImg = new Image();
rocketImg.src = "./export/rocket.png";

const bgImg = new Image();
bgImg.src = "./export/background_game_screen.png";

/* ==============================
      GAME DATA
============================== */
let rocket = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    speed: 0
};

let obstacles = [];
let stars = [];
let score = 0;
let gameRunning = true;
let fallSpeed = 3;

let highScore = localStorage.getItem("glitchHopHighscore") || 0;

/* ==============================
      RESPONSIVE CANVAS
============================== */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    rocket.width = Math.max(50, canvas.width * 0.08);
    rocket.height = rocket.width * 1.15;
    rocket.speed = Math.max(5, canvas.width * 0.015);

    rocket.x = canvas.width / 2 - rocket.width / 2;
    rocket.y = canvas.height - rocket.height - 20;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ==============================
      INPUT HANDLING
============================== */
let keys = {};
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

/* ==============================
      TOUCH / MOUSE INPUT
============================== */
function setupTouchControls() {
    let touching = false;

    function handleStart(e) {
        touching = true;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        keys["ArrowLeft"] = x < canvas.width / 2;
        keys["ArrowRight"] = x >= canvas.width / 2;
    }

    function handleMove(e) {
        if (!touching) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        keys["ArrowLeft"] = x < canvas.width / 2;
        keys["ArrowRight"] = x >= canvas.width / 2;
    }

    function handleEnd() {
        touching = false;
        keys["ArrowLeft"] = false;
        keys["ArrowRight"] = false;
    }

    window.addEventListener("touchstart", handleStart, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("mousedown", handleStart);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
}
setupTouchControls();

/* ==============================
      UTILS
============================== */
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/* ==============================
      SPAWNERS
============================== */
function spawnObstacle() {
    const size = rand(30, canvas.width * 0.08);
    const neonColors = ["#ff00ff", "#00ffff", "#39ff14", "#ff0066", "#ffea00"];

    obstacles.push({
        x: rand(0, canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: fallSpeed,
        color: neonColors[Math.floor(Math.random() * neonColors.length)]
    });

    if (obstacles.length > 50) obstacles.shift();
}

function spawnStar() {
    const size = Math.max(15, canvas.width * 0.03);
    stars.push({
        x: rand(0, canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: fallSpeed + 1
    });

    if (stars.length > 20) stars.shift();
}

/* ==============================
      GLITCH EFFECTS
============================== */
function triggerGlitch() {
    glitchOverlay.style.opacity = 1;

    const shakeX = rand(-25, 25);
    const shakeY = rand(-25, 25);
    document.body.style.transform = `translate(${shakeX}px, ${shakeY}px) rotate(${rand(-1.5,1.5)}deg)`;

    glitchOverlay.style.filter = `
        drop-shadow(4px 0px red)
        drop-shadow(-4px 0px cyan)
        drop-shadow(0px 4px magenta)
    `;

    glitchOverlay.style.background = `
        repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.06) 0px,
            rgba(255,255,255,0.02) 2px,
            rgba(0,0,0,0.12) 4px
        )
    `;

    const sliceTop = rand(10, 70);
    const offset = rand(-40, 40);

    glitchOverlay.style.clipPath = `
        polygon(0 0, 100% 0, 100% ${sliceTop}%, 0 ${sliceTop}%)
    `;
    glitchOverlay.style.transform = `
        translateX(${offset}px) 
        skew(${rand(-5,5)}deg)
    `;

    setTimeout(() => {
        glitchOverlay.style.opacity = 0;
        glitchOverlay.style.filter = "none";
        glitchOverlay.style.background = "none";
        glitchOverlay.style.clipPath = "none";
        glitchOverlay.style.transform = "none";
        document.body.style.transform = "none";
    }, rand(70, 140));
}

/* ==============================
      GAME OVER
============================== */
function endGame() {
    gameRunning = false;
    triggerGlitch();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("glitchHopHighscore", highScore);
        finalScore.innerHTML = `Your Score: ${score}
        <br><span class="newHigh">NEW HIGH SCORE!</span>`;
    } else {
        finalScore.textContent = "Your Score: " + score;
    }

    gameOverScreen.style.display = "flex";
}

restartBtn.addEventListener("click", () => window.location.reload());

/* ==============================
      MAIN GAME LOOP
============================== */
function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    if (keys["ArrowLeft"] && rocket.x > 0) rocket.x -= rocket.speed;
    if (keys["ArrowRight"] && rocket.x < canvas.width - rocket.width) rocket.x += rocket.speed;

    ctx.drawImage(rocketImg, rocket.x, rocket.y, rocket.width, rocket.height);

    if (Math.random() < 0.03) spawnObstacle();
    if (Math.random() < 0.02) spawnStar();

    obstacles.forEach((obs, i) => {
        obs.y += obs.speed;

        ctx.shadowColor = obs.color;
        ctx.shadowBlur = 25;
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;

        if (obs.y > canvas.height) obstacles.splice(i, 1);
        if (isColliding(rocket, obs)) endGame();
    });

    stars.forEach((star, i) => {
        star.y += star.speed;

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(star.x + star.width / 2, star.y + star.height / 2, star.width / 2, 0, Math.PI * 2);
        ctx.fill();

        if (star.y > canvas.height) stars.splice(i, 1);
        if (isColliding(rocket, star)) {
            score += 5;
            stars.splice(i, 1);
            triggerGlitch();
        }
    });

    ctx.fillStyle = "#00ffff";
    ctx.font = `${Math.max(24, canvas.width * 0.025)}px Arial`;
    ctx.fillText("Score: " + score, 10, 40);

    fallSpeed += 0.001;

    if (Math.random() < 0.03) triggerGlitch();

    requestAnimationFrame(update);
}

update();