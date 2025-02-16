const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

const gravity = 0.3;
const jumpPower = -12;

// Generate random unique keys
function getRandomUniqueKeys(existingKeys) {
    const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let assignedKeys = {};
    let usedKeys = new Set(existingKeys);

    function getKey() {
        let key;
        do {
            key = keys[Math.floor(Math.random() * keys.length)];
        } while (usedKeys.has(key));
        usedKeys.add(key);
        return key;
    }

    assignedKeys.left = getKey();
    assignedKeys.right = getKey();
    assignedKeys.jump = getKey();
    assignedKeys.shoot = getKey();
    assignedKeys.shield = getKey();
    return assignedKeys;
}

// Unique keys for both players
const player1Keys = getRandomUniqueKeys([]);
const player2Keys = getRandomUniqueKeys(Object.values(player1Keys));

window.onload = function () {
    document.getElementById("p1Keys").textContent = `Left: ${player1Keys.left}, Right: ${player1Keys.right}, Jump: ${player1Keys.jump}, Shoot: ${player1Keys.shoot}, Shield: ${player1Keys.shield}`;
    document.getElementById("p2Keys").textContent = `Left: ${player2Keys.left}, Right: ${player2Keys.right}, Jump: ${player2Keys.jump}, Shoot: ${player2Keys.shoot}, Shield: ${player2Keys.shield}`;
};

class Player {
    constructor(x, color) {
        this.x = x;
        this.y = 300;
        this.width = 40;
        this.height = 40;
        this.color = color;
        this.speed = 5;
        this.health = 100;
        this.velY = 0;
        this.isJumping = false;
        this.isDead = false;
        this.shieldActive = false;
    }

    moveLeft() { if (!this.isDead) this.x = Math.max(0, this.x - this.speed); }
    moveRight() { if (!this.isDead) this.x = Math.min(canvas.width - this.width, this.x + this.speed); }
    
    jump() {
        if (!this.isJumping && !this.isDead) {
            this.velY = jumpPower;
            this.isJumping = true;
        }
    }

    activateShield() {
        if (!this.isDead) {
            this.shieldActive = true;
            setTimeout(() => { this.shieldActive = false; }, 2000);
        }
    }

    updatePosition() {
        if (this.isDead) return;
        this.y += this.velY;
        this.velY += gravity;
        if (this.y >= 300) { 
            this.y = 300;
            this.isJumping = false;
        }
    }

    takeDamage() {
        if (!this.isDead && !this.shieldActive) {
            this.health -= 20;
            if (this.health <= 0) {
                this.health = 0;
                this.isDead = true;
                endGame(`${this.color.toUpperCase()} Player WINS!`);
            }
        }
    }
}

class Bullet {
    constructor(x, y, direction, color, shooter) {
        this.x = x;
        this.y = y + 15;
        this.width = 10;
        this.height = 5;
        this.speed = 8 * direction;
        this.color = color;
        this.shooter = shooter;
    }

    move() { this.x += this.speed; }
    isOffScreen() { return this.x < 0 || this.x > canvas.width; }

    hasHit(target) {
        return (
            !target.isDead && !target.shieldActive &&
            this.x < target.x + target.width &&
            this.x + this.width > target.x &&
            this.y < target.y + target.height &&
            this.y + this.height > target.y
        );
    }
}

const player1 = new Player(100, "blue");
const player2 = new Player(600, "red");
const bullets = [];
const keysPressed = {};

window.addEventListener("keydown", (e) => {
    keysPressed[e.key.toUpperCase()] = true;

    if (e.key.toUpperCase() === player1Keys.shoot) bullets.push(new Bullet(player1.x + player1.width, player1.y, 1, "blue", player1));
    if (e.key.toUpperCase() === player2Keys.shoot) bullets.push(new Bullet(player2.x, player2.y, -1, "red", player2));
});

window.addEventListener("keyup", (e) => { keysPressed[e.key.toUpperCase()] = false; });

function updateGame() {
    if (player1.isDead || player2.isDead) return;

    bullets.forEach((bullet, index) => {
        bullet.move();
        if (bullet.hasHit(player1)) player1.takeDamage();
        if (bullet.hasHit(player2)) player2.takeDamage();
        if (bullet.isOffScreen()) bullets.splice(index, 1);
    });

    requestAnimationFrame(updateGame);
}

function endGame(winnerText) { document.getElementById("winner").textContent = winnerText; }
function restartGame() { location.reload(); }

updateGame();
