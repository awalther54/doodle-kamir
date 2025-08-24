const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Variables ---
const GRAVITY = 0.5;
const MOVE_SPEED = 7;
const PLATFORM_WIDTH = 60;
const PLATFORM_HEIGHT = 10;
const PLATFORM_GAP = 100;
const INITIAL_PLATFORM_COUNT = 5;

let leftPressed = false;
let rightPressed = false;
let spacePressed = false;

let gameStarted = false;

let score = 0;
let platformsTouched = new Set();

let frozen = false;

// --- Game Objects ---
let doodler = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  velocityY: 0,
  velocityX: 0,
  jumpPower: 11,
};

// Ground platform
let platforms = [
  { x: 0, y: canvas.height - 10, width: canvas.width, height: 10 },
]; 

// --- Event Listeners ---
document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") leftPressed = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") rightPressed = true;
  if (e.code === "Space") spacePressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") leftPressed = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") rightPressed = false;
  if (e.code === "Space") spacePressed = false;
});

// --- Game Functions ---
function resetGame() {
  // Reset doodler
  doodler.x = canvas.width / 2 - 20;
  doodler.y = canvas.height - 60;
  doodler.velocityY = 0;
  doodler.velocityX = 0;

  // Reset platforms
  platforms = [
    { x: 0, y: canvas.height - 10, width: canvas.width, height: 10 },
  ];

  initializePlatforms();

  // Reset controls and game state
  leftPressed = false;
  rightPressed = false;
  spacePressed = false;
  gameStarted = false;

  // Reset score
  score = 0;
  platformsTouched = new Set();

  // Remove Game Over div if it exists
  document.body.removeChild(document.getElementById("gameOverBox"));
}

function GameOver() {
  frozen = true;

  // Only create the Game Over div if it doesn't exist
  let gameOverDiv = document.getElementById("gameOverBox");
  if (!gameOverDiv) {
    gameOverDiv = document.createElement("div");
    gameOverDiv.id = "gameOverBox";
    gameOverDiv.style.position = "absolute";
    gameOverDiv.style.left = "50%";
    gameOverDiv.style.transform = "translateX(-50%)";
    gameOverDiv.style.top = "40%";
    gameOverDiv.style.fontFamily = "'Press Start 2P', monospace";
    gameOverDiv.style.fontSize = "24px";
    gameOverDiv.style.color = "red";
    gameOverDiv.style.background = "none";
    gameOverDiv.style.zIndex = "10";
    gameOverDiv.innerHTML = `
    Game Over! <br><br>
    Final Score: ${score - 5} <br><br>
    Press Space to Restart.
    `;

    document.body.appendChild(gameOverDiv);
  }

  // Handler to restart game and clean up
  function restartHandler(e) {
    if (e.code === "Space" && frozen) {
      if (gameOverDiv && document.body.contains(gameOverDiv)) {
        document.body.removeChild(gameOverDiv);
      }

      frozen = false;
      resetGame();
      document.removeEventListener("keydown", restartHandler);
    }
  }
  document.addEventListener("keydown", restartHandler);
}

function drawDoodler() {
  //TODO: Replace with sprite
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);
}

function drawScoreHTML() {
  let scoreDiv = document.getElementById("scoreBox");

  // Create score div if it doesn't exist
  if (!scoreDiv) {
    scoreDiv = document.createElement("div");
    scoreDiv.id = "scoreBox";
    scoreDiv.style.position = "absolute";
    scoreDiv.style.left = "20%";
    scoreDiv.style.transform = "translateX(-50%)";
    scoreDiv.style.top = "80px";
    scoreDiv.style.fontFamily = "'Press Start 2P', monospace";
    scoreDiv.style.fontSize = "24px";
    scoreDiv.style.color = "black";
    scoreDiv.style.background = "none";
    scoreDiv.style.zIndex = "10";
    document.body.appendChild(scoreDiv);

    // Add retro font
    const style = document.createElement("style");
    style.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`;
    document.head.appendChild(style);
  }
  scoreDiv.textContent = `Score: ${score - 5}`;
}

function addPlatform(y) {
  platforms.push({
    x: Math.random() * (canvas.width - PLATFORM_WIDTH),
    y: y,
    width: PLATFORM_WIDTH,
    height: PLATFORM_HEIGHT,
  });
}

function drawPlatforms() {
  // TODO: Replace with sprite
  ctx.fillStyle = "#8d6e63";
  platforms.forEach((p) => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

function initializePlatforms() {
  for (let i = 0; i < INITIAL_PLATFORM_COUNT; i++) {
    addPlatform(canvas.height - i * PLATFORM_GAP);
  }
}

function updatePlatforms() {
  if (gameStarted && !frozen) {
    platforms.forEach((p) => {
      p.y += 1; // Move platforms down
    });

    // Move platforms down as doodler moves up
    if (doodler.y < canvas.height / 2) {
      let dy = canvas.height / 2 - doodler.y;
      doodler.y = canvas.height / 2;
      platforms.forEach((p) => (p.y += dy));
    }

    // Remove platforms that are off screen
    clearPlatforms();
  }
}

function updatePlayerMovement() {
  // TODO: Fix jitter when landing on platform
  // Add animation frames for jumping and falling
  if (!frozen) {
    // Horizontal movement
    if (leftPressed) {
      doodler.velocityX = -MOVE_SPEED;
    } else if (rightPressed) {
      doodler.velocityX = MOVE_SPEED;
    } else {
      doodler.velocityX = 0;
    }

    doodler.x += doodler.velocityX;

    // Wrap around screen
    if (doodler.x < -doodler.width) doodler.x = canvas.width;
    if (doodler.x > canvas.width) doodler.x = -doodler.width;

    // Gravity and jumping
    doodler.velocityY += GRAVITY;
    doodler.y += doodler.velocityY;
  }
}

function generatePlatforms() {
  while (platforms.length < INITIAL_PLATFORM_COUNT) {
    let highestPlatformY = Math.min(...platforms.map((p) => p.y));
    addPlatform(highestPlatformY - PLATFORM_GAP);
  }
}

function clearPlatforms() {
  platforms = platforms.filter((p) => p.y < canvas.height);
}

function isColliding() {
  if (doodler.velocityY > 0) {
    // Only check when falling
    for (let p of platforms) {
      if (
        doodler.x + doodler.width > p.x &&
        doodler.x < p.x + p.width &&
        doodler.y + doodler.height > p.y &&
        doodler.y + doodler.height < p.y + p.height + doodler.velocityY
      ) {
        // Snap doodler to platform
        doodler.y = p.y - doodler.height;
        doodler.velocityY = 0;

        // Score: only count each platform once
        if (!platformsTouched.has(p)) {
          score += 5;
          platformsTouched.add(p);
        }
        return true;
      }
    }
  }
  return false;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatforms();
  drawDoodler();
  drawScoreHTML();

  // Dynamically generate new platforms as doodler moves up
  generatePlatforms();

  // Start the game when space is pressed for the first time
  if (spacePressed) {
    gameStarted = true;
  }

  // Move the platforms down if the game has started
  updatePlatforms();

  // --- Movement and physics ---
  updatePlayerMovement();

  // Platform collision (stand)
  let onPlatform = isColliding();

  // Jump only when space is pressed and doodler is on a platform
  if (spacePressed && onPlatform && !frozen) {
    doodler.velocityY = -doodler.jumpPower;
  }

  // Prevent falling below screen (resets the game)
  if (doodler.y > canvas.height) {
    GameOver();
  }

  requestAnimationFrame(gameLoop);
}

// Initialize platforms
initializePlatforms();

gameLoop();
