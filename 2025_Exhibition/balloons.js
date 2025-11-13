// Falling Balloons Overlay
let balloons = [];
let balloonCount = 20; // Number of balloons on screen
let spawnRate = 500; // Milliseconds between spawns
let lastSpawn = 0;

// Balloon colors
const balloonColors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFE66D', // Yellow
    '#95E1D3', // Mint
    '#F38181', // Pink
    '#AA96DA', // Purple
    '#FCBAD3', // Light Pink
    '#A8D8EA', // Light Blue
    '#FF9A9E', // Coral
    '#FFC75F', // Orange
];

class Balloon {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = -100; // Start above screen
        this.size = 20 + Math.random() * 20; // Random size between
        this.speed = 1 + Math.random() * 2; // Falling speed
        this.sway = Math.random() * Math.PI * 2; // Random starting sway
        this.swaySpeed = 0.02 + Math.random() * 0.03;
        this.swayAmount = 20 + Math.random() * 30;
        this.color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        this.rotation = -5 + Math.random() * 10; // Slight tilt
        this.stringLength = 80 + Math.random() * 40;
        this.alpha = 0.8 + Math.random() * 0.2; // Slight transparency variation
    }

    update() {
        // Fall downward
        this.y += this.speed;

        // Sway left and right
        this.sway += this.swaySpeed;
        this.x += Math.sin(this.sway) * 0.5;

        // Check if balloon has fallen off screen
        return this.y - this.size > window.innerHeight;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Draw balloon body
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);

        // Balloon gradient
        let gradient = ctx.createRadialGradient(
            -this.size * 0.2, -this.size * 0.2, 0,
            0, 0, this.size
        );
        gradient.addColorStop(0, this.lightenColor(this.color, 40));
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 20));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Helper function to lighten color
    lightenColor(color, percent) {
        let num = parseInt(color.replace('#', ''), 16);
        let amt = Math.round(2.55 * percent);
        let R = (num >> 16) + amt;
        let G = (num >> 8 & 0x00FF) + amt;
        let B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    // Helper function to darken color
    darkenColor(color, percent) {
        let num = parseInt(color.replace('#', ''), 16);
        let amt = Math.round(2.55 * percent);
        let R = (num >> 16) - amt;
        let G = (num >> 8 & 0x00FF) - amt;
        let B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
            (G > 0 ? G : 0) * 0x100 +
            (B > 0 ? B : 0))
            .toString(16).slice(1);
    }
}

// Create canvas overlay
function initBalloonOverlay() {
    const canvas = document.createElement('canvas');
    canvas.id = 'balloon-overlay';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
    canvas.style.zIndex = '9999'; // On top of everything
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Set canvas resolution
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn new balloons
        let now = Date.now();
        if (now - lastSpawn > spawnRate && balloons.length < balloonCount) {
            balloons.push(new Balloon());
            lastSpawn = now;
        }

        // Update and draw balloons
        balloons = balloons.filter(balloon => {
            let shouldKeep = !balloon.update();
            if (shouldKeep) {
                balloon.draw(ctx);
            }
            return shouldKeep;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// Auto-start when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBalloonOverlay);
} else {
    initBalloonOverlay();
}

// Export for manual control
window.balloonOverlay = {
    start: initBalloonOverlay,
    setBalloonCount: (count) => { balloonCount = count; },
    setSpawnRate: (rate) => { spawnRate = rate; },
    clear: () => { balloons = []; }
};
