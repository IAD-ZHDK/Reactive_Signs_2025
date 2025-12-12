// - structure adapted from template
// - logic for poster variables

let particles = [];
let currentDigit = -1;
let lastIntegerDigit = -1;

// Configuration
let GRID_SIZE;

let digitMaps = {};
let digitTextures = []; // Array to store the 10 GIF textures
let myFont;

function preload() {
    // Load font
    myFont = loadFont('barlow_condensed.otf');

    // Load the GIF textures for numbers 0 through 9
    // Assumes files are named "0.gif", "1.gif", ..., "9.gif"
    for (let i = 0; i <= 9; i++) {
        digitTextures[i] = loadImage('images/' + i + '.gif');
    }
}

function setup() {
    createCanvas(100, 100, WEBGL);
    defineDigits();
    noStroke();
    textFont(myFont);
}
function windowResized() {
    defineDigits();
}

function draw() {
    background(0); // set bac

    // --- VARIABLES ---
    let rawCounter = poster.getCounter();
    let displayDigit = Math.floor(rawCounter);
    displayDigit = displayDigit % 10;

    // Sizing
    GRID_SIZE = 10 * poster.vw;

    // --- LOGIC ---
    if (displayDigit !== currentDigit) {
        changeDigit(displayDigit);
        currentDigit = displayDigit;
    }

    // --- LIGHTING ---
    ambientLight(100);

    // Diagonal Sine Wave Lighting
    let t = millis();
    let sweep = map(sin(t * 0.0005), -1, 1, -width / 2, width / 2);
    let wobble = sin(t * 0.005) * 200;
    pointLight(255, 255, 255, sweep, sweep + wobble, 600);

    directionalLight(255, 255, 255, 1, 1, -1);

    // --- INTERACTION: USING poster.position ---

    // Safety check for width/height to prevent division by zero errors
    let w = width || 1;
    let h = height || 1;

    // 1. Calculate Wave Phases based on user mouse position
    // REPLACED poster.posNormal with poster.position
    // Map 0 -> width to 0 -> 4PI
    let wavePhaseX = map(poster.position.x, 0, w, 0, TWO_PI * 2);
    let wavePhaseY = map(poster.position.y, 0, h, 0, TWO_PI * 2);

    // 2. Fixed Frame Rotation (Parallax)
    // REPLACED poster.posNormal with poster.position
    // Map 0 -> width to -30 -> +30 degrees
    let rotY = map(poster.position.x, 0, w, -PI / 6, PI / 6);
    let rotX = map(poster.position.y, 0, h, -PI / 6, PI / 6);

    // Constrain to keep it within a safe viewing angle
    rotY = constrain(rotY, -PI / 4, PI / 4);
    rotX = constrain(rotX, -PI / 4, PI / 4);

    push();
    rotateX(rotX);
    rotateY(rotY);

    // Gentle idle wobble
    rotateX(sin(millis() * 0.001) * 0.05);
    rotateZ(cos(millis() * 0.001) * 0.02);

    // Center the digit grid
    translate(-3.5 * GRID_SIZE, -5 * GRID_SIZE, 0);

    // --- DRAW PARTICLES ---
    for (let p of particles) {
        p.update();
        // Pass the wave phases to the display function
        p.display(wavePhaseX, wavePhaseY);
    }

    pop();
}

function changeDigit(num) {
    let nextCoords = digitMaps[num];

    // Pick the correct texture for this number
    let newTexture = digitTextures[num];

    let maxCount = Math.max(particles.length, nextCoords.length);

    for (let i = 0; i < maxCount; i++) {
        if (i < nextCoords.length) {
            let targetPos = createVector(
                nextCoords[i].x * GRID_SIZE,
                nextCoords[i].y * GRID_SIZE,
                0
            );

            if (i < particles.length) {
                // Reuse particle: Update target and TEXTURE
                particles[i].setTarget(targetPos, true);
                particles[i].tex = newTexture;
            } else {
                // New particle: Create with TEXTURE
                let p = new Particle(targetPos.x, targetPos.y, 0, newTexture);
                p.setTarget(targetPos, true);
                particles.push(p);
            }
        } else {
            if (i < particles.length) {
                particles[i].active = false;
                particles[i].setTarget(createVector(
                    random(-500, 500),
                    random(-500, 500),
                    -2000
                ), false);
            }
        }
    }
}

// --- Classes ---

class Particle {
    constructor(x, y, z, textureImg) {
        this.pos = createVector(x, y, z);
        this.target = createVector(x, y, z);
        this.active = true;

        // Store the texture
        this.tex = textureImg || digitTextures[0];
        this.animOffset = random(100);
    }

    setTarget(t, isActive) {
        this.target = t;
        this.active = isActive;
    }

    update() {
        let speed = 0.08;
        this.pos.x = lerp(this.pos.x, this.target.x, speed);
        this.pos.y = lerp(this.pos.y, this.target.y, speed);

        let d = p5.Vector.dist(this.pos, this.target);
        if (d > 10 * poster.vw) {
            let bulge = sin(millis() * 0.01 + this.animOffset) * (20 * poster.vw);
            this.pos.z = lerp(this.pos.z, this.target.z + bulge, speed);
        } else {
            this.pos.z = lerp(this.pos.z, this.target.z, speed);
        }
    }

    display(phaseX, phaseY) {
        if (!this.active && this.pos.z < -1000) return;

        push();
        translate(this.pos.x, this.pos.y, this.pos.z);

        rotateX(frameCount * 0.02 + this.animOffset);
        rotateY(frameCount * 0.02 + this.animOffset);

        noStroke();

        // --- SINE WAVE GRADIENT LOGIC ---

        // 1. Calculate Wave Value
        let freq = 0.4;
        let nx = this.pos.x / GRID_SIZE;
        let ny = this.pos.y / GRID_SIZE;

        // val oscillates between -1 and 1 based on position + user interaction
        let val = sin((nx * freq) + (ny * freq) + phaseX + phaseY);

        // 2. Map Wave to Opacity Gradient
        // When wave is -1 (trough), opacity is LOW (20)
        // When wave is 1 (crest), opacity is HIGH (255)
        let minOpacity = 90;
        let maxOpacity = 255;
        let targetAlpha = map(val, -1, 1, minOpacity, maxOpacity);

        // 3. Combine with Depth Fading
        let depthAlpha = this.active ? 1.0 : map(this.pos.z, 0, -2000, 1, 0);
        let finalAlpha = targetAlpha * depthAlpha;

        // 4. Apply Texture
        tint(255, 255, 255, finalAlpha);

        if (this.tex) {
            texture(this.tex);
        } else {
            fill(220, finalAlpha);
        }

        // Optional: Scale pop effect
        if (abs(val) < 0.1) {
            scale(1.1);
        }

        let s = this.active ? GRID_SIZE * 0.8 : map(this.pos.z, 0, -2000, GRID_SIZE, 0);
        if (s > 0) box(s);
        pop();
    }
}

function defineDigits() {
    const build = (str) => {
        let coords = [];
        let rows = str.trim().split('\n');
        for (let y = 0; y < rows.length; y++) {
            let cols = rows[y].trim().split('');
            for (let x = 0; x < cols.length; x++) {
                if (cols[x] === '#') {
                    coords.push({ x: x, y: y });
                }
            }
        }
        return coords;
    };

    digitMaps[0] = build(`
    .######.
    ###..###
    ##....##
    ##....##
    ##....##
    ##....##
    ##....##
    ##....##
    ##....##
    ###..###
    .######.
    ........
    ........
    `);

    digitMaps[1] = build(`
    ...##...
    ..####..
    .#.###..
    ....##..
    ....##..
    ....##..
    ....##..
    ....##..
    ....##..
    .#######
    .#######
    ........
    ........
    `);

    digitMaps[2] = build(`
    .######.
    ###..###
    ##....##
    ##....##
    .....###
    ....###.
    ...###..
    ..###...
    .###....
    ###.....
    ########
    ########
    ........
    ........
    `);

    digitMaps[3] = build(`
    .######.
    ########
    ##....##
    ......##
    ....###.
    ...###..
    ....##..
    .....##.
    ......##
    ##....##
    ##....##
    ########
    ........
    `);

    digitMaps[4] = build(`
    ....##..
    ...###..
    ..####..
    .##.##..
    ##..##..
    #######.
    #######.
    ....##..
    ....##..
    ....##..
    ....##..
    ........
    ........
    `);

    digitMaps[5] = build(`
    #######.
    #######.
    ##......
    ##......
    ######..
    ######..
    .....##.
    .....##.
    .....##.
    ##...##.
    ##...##.
    #######.
    ........
    `);

    digitMaps[6] = build(`
    ..###...
    .##.##..
    ##...##.
    ##......
    #####...
    ##...##.
    ##...##.
    ##...##.
    ##...##.
    .##.##..
    ..###...
    ........
    ........
    `);

    digitMaps[7] = build(`
    #######.
    #######.
    .....##.
    ....##..
    ...##...
    ..##....
    ..##....
    ..##....
    ..##....
    ..##....
    ..##....
    ........
    ........
    `);

    digitMaps[8] = build(`
    .#####..
    ##...##.
    ##...##.
    ##...##.
    .#####..
    .#####..
    ##...##.
    ##...##.
    ##...##.
    ##...##.
    .#####..
    ........
    ........
    `);

    digitMaps[9] = build(`
    .#####..
    ##...##.
    ##...##.
    ##...##.
    ##...##.
    .######.
    .....##.
    .....##.
    .....##.
    ##...##.
    .#####..
    ........
    ........
    `);
}