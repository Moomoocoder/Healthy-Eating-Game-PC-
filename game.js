// Game setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Sound elements
const backgroundSound = document.getElementById("backgroundSound");
const gameFinishedSound = document.getElementById("gameFinishedSound");
const gameOverSound = document.getElementById("gameOverSound");
const jumpSound = document.getElementById("jumpSound");
const goodFoodSound = document.getElementById("goodFoodSound");
const badFoodSound = document.getElementById("badFoodSound");

// Variables
let health = 10;
let gameOver = false; // Flag to stop the game when reaching the prize
let goodFoodsEaten = 0;
let badFoodsEaten = 0;

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const gameSummary = document.getElementById("gameSummary");

// Player setup (using a human emoji)
const player = {
    x: 50,
    y: canvas.height - 50,
    width: 30, // Approximate size of emoji
    height: 30,
    emoji: "🧑", // Human emoji
    speed: 3,
    isJumping: false,
    jumpSpeed: 0,
    gravity: 0.5
};

// Emojis for foods
const goodFoods = ["🥦", "🐟", "🥔", "🫒", "🧅", "🍠", "🍅", "🌰", "🍲", "🍆", "🍗", "🌿"];
const badFoods = ["🍔", "🥩", "🍬", "🍖", "🥐", "🥤", "🍰", "🍩"];

// Track
let trackSpeed = 2;
const trackSpeedIncrement = 0.001; // Small increment to gradually increase speed
const trackLength = 60000; // Move for approx 1 minute at 60fps
let trackProgress = 0;

// Prize
const prize = {
    x: trackLength - 100,
    y: canvas.height - 100,
    emoji: "🏆", // Prize emoji
    size: 50 // Large size for the prize
};

// Keyboard controls
const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.code === "Space" && !player.isJumping) {
        player.isJumping = true;
        player.jumpSpeed = -10;
        jumpSound.play(); // Play jump sound
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function startGame() {
    startButton.style.display = "none";
    canvas.style.display = "block";
    backgroundSound.play();
    updateGame();
}

// Create food items randomly
function createFood() {
    const isGoodFood = Math.random() > 0.5; // 50% chance for good or bad food
    const emoji = isGoodFood
        ? goodFoods[Math.floor(Math.random() * goodFoods.length)]
        : badFoods[Math.floor(Math.random() * badFoods.length)];
    foods.push({
        x: canvas.width + Math.random() * 300,
        y: Math.random() * (canvas.height - 30), // Random y position within canvas
        emoji: emoji,
        effect: isGoodFood ? 1 : -2
    });
}

// Food items array
const foods = [];

// Game update
function updateGame() {
    if (gameOver) return; // Stop the game if it's over

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player movement based on key presses
    if (keys["ArrowUp"] || keys["w"]) player.y = Math.max(0, player.y - player.speed);
    if (keys["ArrowDown"] || keys["s"]) player.y = Math.min(canvas.height - player.height, player.y + player.speed);

    // Apply jump physics
    if (player.isJumping) {
        player.y += player.jumpSpeed;
        player.jumpSpeed += player.gravity;
        if (player.y >= canvas.height - player.height) {
            player.y = canvas.height - player.height;
            player.isJumping = false;
        }
    }

    // Move track
    trackProgress += trackSpeed;
    if (trackProgress >= trackLength) {
        // Check if player reaches the prize
        if (player.x + player.width >= prize.x - trackProgress + canvas.width && player.y + player.height >= prize.y) {
            endGame();
            return;
        }
    }

    // Gradually increase the track speed over time
    trackSpeed += trackSpeedIncrement;

    // Generate food
    if (Math.random() < 0.03) createFood();

    // Update foods
    foods.forEach((food, index) => {
        food.x -= trackSpeed;

        // Collision detection
        if (food.x < player.x + player.width &&
            food.x + 30 > player.x && // Approximate width of emoji
            food.y < player.y + player.height &&
            food.y + 30 > player.y) { // Approximate height of emoji
                health += food.effect;
                if (food.effect > 0) {
                  goodFoodsEaten++;
                  goodFoodSound.play();
                } else {
                  badFoodsEaten++;
                  badFoodSound.play();
                }
                foods.splice(index, 1);
        }

        // Remove food if it goes off screen
        if (food.x < -30) { // Approximate width of emoji
            foods.splice(index, 1);
        }
    });

    // Draw prize as a large emoji
    if (trackProgress >= trackLength - canvas.width) {
        ctx.font = `${prize.size}px Arial`;
        ctx.fillText(prize.emoji, prize.x - trackProgress + canvas.width, prize.y + prize.size);
    }

    // Draw player as an emoji
    ctx.font = "30px Arial";
    ctx.fillText(player.emoji, player.x, player.y + player.height);

    // Draw foods as larger emojis
    foods.forEach((food) => {
        ctx.font = "30px Arial";
        ctx.fillText(food.emoji, food.x, food.y + 30); // Draw emoji with larger size
    });

    // Draw health inside canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText(`Health: ${health}`, 10, 30);

    // Game over condition
    if (health <= 0) {
        gameOverSound.play(); // Play game over sound
        displayGameOver();
        return;
    } else {
        // runs the game
        requestAnimationFrame(updateGame);
    }}
