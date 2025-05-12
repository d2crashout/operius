// Operius - Full Refactored Version
// HTML5 Canvas Game - Cleaned & Modular

(function () {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const GAME_WIDTH = canvas.width;
    const GAME_HEIGHT = canvas.height;

    class Player {
        constructor() {
            this.width = 40;
            this.height = 40;
            this.x = GAME_WIDTH / 2 - this.width / 2;
            this.y = GAME_HEIGHT - this.height - 10;
            this.speed = 6;
            this.health = 3;
            this.color = "lime";
            this.cooldown = 0;
        }

        move(left, right) {
            if (left) this.x = Math.max(this.x - this.speed, 0);
            if (right) this.x = Math.min(this.x + this.speed, GAME_WIDTH - this.width);
        }

        shoot(bullets) {
            if (this.cooldown === 0) {
                bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y));
                this.cooldown = 15;
            }
        }

        updateCooldown() {
            if (this.cooldown > 0) this.cooldown--;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Bullet {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 4;
            this.height = 10;
            this.speed = 8;
            this.color = "white";
        }

        update() {
            this.y -= this.speed;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Enemy {
        constructor(x, y, speed) {
            this.x = x;
            this.y = y;
            this.width = 40;
            this.height = 40;
            this.speed = speed;
            this.color = "red";
        }

        update() {
            this.y += this.speed;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Powerup {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = 20;
            this.speed = 3;
            this.color = "gold";
        }

        update() {
            this.y += this.speed;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    const player = new Player();
    const bullets = [];
    const enemies = [];
    const powerups = [];

    let score = 0;
    let wave = 1;
    let keys = {};
    let spawnCooldown = 0;

    // Input Handling
    window.addEventListener("keydown", (e) => keys[e.key] = true);
    window.addEventListener("keyup", (e) => keys[e.key] = false);

    function spawnEnemy() {
        const x = Math.random() * (GAME_WIDTH - 40);
        const speed = 1 + wave * 0.3;
        enemies.push(new Enemy(x, -40, speed));
    }

    function spawnPowerup() {
        const x = Math.random() * (GAME_WIDTH - 20);
        powerups.push(new Powerup(x, -20));
    }

    function checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    function updateGame() {
        player.move(keys["ArrowLeft"], keys["ArrowRight"]);
        if (keys[" "]) player.shoot(bullets);
        player.updateCooldown();

        bullets.forEach((b, i) => {
            b.update();
            if (b.y < 0) bullets.splice(i, 1);
        });

        enemies.forEach((e, i) => {
            e.update();
            if (e.y > GAME_HEIGHT) enemies.splice(i, 1);
            if (checkCollision(player, e)) {
                enemies.splice(i, 1);
                player.health--;
                if (player.health <= 0) resetGame();
            }
            bullets.forEach((b, j) => {
                if (checkCollision(b, e)) {
                    bullets.splice(j, 1);
                    enemies.splice(i, 1);
                    score += 10;
                }
            });
        });

        powerups.forEach((p, i) => {
            p.update();
            if (p.y > GAME_HEIGHT) powerups.splice(i, 1);
            if (checkCollision(player, p)) {
                powerups.splice(i, 1);
                player.health++;
            }
        });

        spawnCooldown--;
        if (spawnCooldown <= 0) {
            spawnEnemy();
            if (Math.random() < 0.05) spawnPowerup();
            spawnCooldown = Math.max(15, 60 - wave * 2);
        }

        if (score >= wave * 100) wave++;
    }

    function renderGame() {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        player.draw(ctx);
        bullets.forEach(b => b.draw(ctx));
        enemies.forEach(e => e.draw(ctx));
        powerups.forEach(p => p.draw(ctx));

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Score: " + score, 10, 20);
        ctx.fillText("Health: " + player.health, 10, 40);
        ctx.fillText("Wave: " + wave, 10, 60);
    }

    function resetGame() {
        player.x = GAME_WIDTH / 2 - player.width / 2;
        player.y = GAME_HEIGHT - player.height - 10;
        player.health = 3;
        bullets.length = 0;
        enemies.length = 0;
        powerups.length = 0;
        score = 0;
        wave = 1;
    }

    function gameLoop() {
        updateGame();
        renderGame();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
})();
