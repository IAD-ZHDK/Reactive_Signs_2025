
const IMAGE_NAMES = [
    "cero.png", "uno.png", "dos.png", "tres.png", "cuatro.png",
    "cinco.png", "seis.png", "siete.png", "ocho.png", "nueve.png"
];
let imagesOriginal = [];
let images = [];
let imageIndex = 0;


let isTransitioning = false;
let transitionStartTime = 0;
// Rapidez de la transición
const GROW_FRAMES = 5;


let step = 8;
//let pixels = [];
let pixelSets = [];
let CANVAS_WIDTH;
let CANVAS_HEIGHT;

let amplitude = 20;
const frequency_X = 0.08;
const frequency_Y = 0.02
const speed = 0.025; // const speed = 0.15;  @ framerate 10

let particulas = [];

const MAX_SIMULTANEOUS_EXPLOSIONS = 13;
const MAX_PARTICLES_PER_SPARK = 7;
const MIN_PARTICLES_PER_SPARK = 3;

const MIN_BRIGHTNESS_FOR_SPARK = 50;

let INITIAL_PARTICLE_SIZE_MIN = 8;
let INITIAL_PARTICLE_SIZE_MAX = 15;

let font;

function preload() {
    for (let i = 0; i < IMAGE_NAMES.length; i++) {
        images.push(loadImage("images/" + IMAGE_NAMES[i]));
    }
    font = loadFont('barlow_condensed.otf');
}

function setup() {

    createCanvas(100, 100, WEBGL);

    CANVAS_WIDTH = floor(poster.vw * 85);
    CANVAS_HEIGHT = floor(poster.vh * 90);

    // Ensure step is at least 1 and tied to the smaller canvas dimension to avoid zero or overshoot
    step = max(1, floor(min(CANVAS_WIDTH, CANVAS_HEIGHT) / 45));

    INITIAL_PARTICLE_SIZE_MIN = width * 0.19;
    INITIAL_PARTICLE_SIZE_MAX = width * 0.1;

    noStroke();

    for (let i = 0; i < images.length; i++) {
        images[i].resize(CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    imageMode(CENTER);
    // frameRate(10);
    imageIndex = poster.getCounter() % images.length;
    initializePixels(images[imageIndex]);
    textFont(font)
    amplitude = poster.vw * 5;
}


function initializePixels(initialImage) {
    initialImage.loadPixels();

    for (let x = 0; x < initialImage.width; x += step) {
        pixels[x] = [];
        for (let y = 0; y < initialImage.height; y += step) {
            let c = initialImage.get(x, y);
            let initialSize = random(INITIAL_PARTICLE_SIZE_MIN, INITIAL_PARTICLE_SIZE_MAX);
            pixels[x][y] = { x: x, y: y, color: c, size: initialSize, originalSize: initialSize };
        }
    }
    for (let i = 0; i < images.length; i++) {
        pixelSets[i] = getPixelColours(i)
    }
}


function updatePixelsColors(newImageIndex) {
    //let currentImage = images[newImageIndex];
    //currentImage.loadPixels();
    let pixelColors = pixelSets[newImageIndex];
    for (let x = 0; x < pixelColors.length; x += step) {
        for (let y = 0; y < pixelColors[x].length; y += step) {
            // let c = currentImage.get(x, y);
            let newSize = random(INITIAL_PARTICLE_SIZE_MIN, INITIAL_PARTICLE_SIZE_MAX);
            pixelColors[x][y].originalSize = newSize;
            pixelColors[x][y].size = 0; // Se inicializa a 0 para crecer
        }
    }
}


function getPixelColours(newImageIndex) {
    let currentImage = images[newImageIndex];
    currentImage.loadPixels();
    let pixelColors = [];
    for (let x = 0; x < currentImage.width; x += step) {
        pixelColors[x] = [];
        for (let y = 0; y < currentImage.height; y += step) {
            let initialSize = random(INITIAL_PARTICLE_SIZE_MIN, INITIAL_PARTICLE_SIZE_MAX);
            pixelColors[x][y] = { x: x, y: y, color: 100, size: initialSize, originalSize: initialSize };
            let c = currentImage.get(x, y);
            // pixelColors 
            pixelColors[x][y].color = c;
            let newSize = random(INITIAL_PARTICLE_SIZE_MIN, INITIAL_PARTICLE_SIZE_MAX);
            pixelColors[x][y].originalSize = newSize;
            pixelColors[x][y].size = 0; // Se inicializa a 0 para crecer
        }
    }
    return pixelColors;
}
// Detecta el cambio de número y activa la transición
function handleImageChangeAndTransition() {
    let currentCounter = poster.getCounter();
    let newImageIndex = currentCounter % images.length;

    if (newImageIndex !== imageIndex) {

        imageIndex = newImageIndex;
        updatePixelsColors(imageIndex);

        isTransitioning = true;
        transitionStartTime = frameCount;
    }
    pixels = pixelSets[imageIndex];
    if (isTransitioning) {
        let elapsedFrames = frameCount - transitionStartTime;
        let mixFactor = constrain(elapsedFrames / GROW_FRAMES, 0, 1);

        for (let x = 0; x < CANVAS_WIDTH; x += step) {
            for (let y = 0; y < CANVAS_HEIGHT; y += step) {
                if (pixels[x] && pixels[x][y] && brightness(pixels[x][y].color) > 0) {
                    pixels[x][y].size = lerp(0, pixels[x][y].originalSize, mixFactor);
                } else if (pixels[x] && pixels[x][y]) {
                    pixels[x][y].size = 0;
                }
            }
        }

        if (elapsedFrames >= GROW_FRAMES) {
            isTransitioning = false;
        }
    }
    else {
        randomizeStableSize();
    }
}

function draw() {
    push()
    translate(-width / 2, -height / 2); // offset for WEBGL mode
    let spacingx = poster.vw * 10;
    let spacingy = poster.vh * 5;

    translate(spacingx, spacingy)

    handleImageChangeAndTransition();


    MovingFire();

    if (!isTransitioning) {
        Explosions();
    }
    pop()
}


function randomizeStableSize() {
    for (let x = 0; x < CANVAS_WIDTH; x += step) {
        for (let y = 0; y < CANVAS_HEIGHT; y += step) {
            if (pixels[x] && pixels[x][y]) {
                let pixel = pixels[x][y];

                if (brightness(pixel.color) > 0) {
                    pixel.size = random(INITIAL_PARTICLE_SIZE_MIN, INITIAL_PARTICLE_SIZE_MAX);
                } else {
                    pixel.size = 0;
                }
            }
        }
    }
}

function MovingFire() {
    background(0);
    let circleCount = 0;
    for (let x = 0; x < CANVAS_WIDTH; x += step) {
        for (let y = 0; y < CANVAS_HEIGHT; y += step) {
            let pixel = pixels[x][y];

            let angle = pixel.y * frequency_Y + frameCount * speed;
            let offsetX = sin(angle) * amplitude;
            let newX = pixel.x + offsetX;

            push();
            if (pixel.size > 0.5) {
                fill(pixel.color);
                circleCount++;
                circle(newX, pixel.y, pixel.size);
            }
            pop();
        }
    }
    // console.log("Circles drawn: " + circleCount);
}

function findValidPixelCoord() {
    let attempts = 0;
    const MAX_ATTEMPTS = 50;

    let max_x = CANVAS_WIDTH;
    let max_y = CANVAS_HEIGHT;

    while (attempts < MAX_ATTEMPTS) {
        let randX = floor(random(0, max_x) / step) * step;
        let randY = floor(random(0, max_y) / step) * step;

        if (randX < max_x && randY < max_y) {
            let pixelData = pixels[randX][randY];

            if (brightness(pixelData.color) > MIN_BRIGHTNESS_FOR_SPARK && pixelData.size > 1) {
                return { x: pixelData.x, y: pixelData.y };
            }
        }
        attempts++;
    }

    return {
        x: random(0, max_x),
        y: random(0, max_y)
    };
}


function Explosions() {
    let maxIntentos = map(poster.position.x, 0, CANVAS_WIDTH, 0, MAX_SIMULTANEOUS_EXPLOSIONS);
    let intentos = floor(maxIntentos);

    for (let j = 0; j < intentos; j++) {
        let cantidadParticulas = floor(random(MIN_PARTICLES_PER_SPARK, MAX_PARTICLES_PER_SPARK + 1));

        let validCoord = findValidPixelCoord();
        let explosionX = validCoord.x;
        let explosionY = validCoord.y;

        for (let i = 0; i < cantidadParticulas; i++) {
            let x = explosionX;
            let y = explosionY;

            let vel = p5.Vector.random2D();
            vel.mult(random(1, 10));
            particulas.push(new Particle(x, y, vel));
        }
    }

    for (let i = particulas.length - 1; i >= 0; i--) {
        let p = particulas[i];
        p.update();
        p.show();

        if (p.isFinished()) {
            particulas.splice(i, 1);
        }
    }
}

function mousePressed() {
    let cantidadParticulas = floor(random(10, 30));
    for (let i = 0; i < cantidadParticulas; i++) {
        let x = poster.position.x;
        let y = poster.position.y;
        let vel = p5.Vector.random2D();
        vel.mult(random(1, 10));
        particulas.push(new Particle(x, y, vel));
    }
}

class Particle {
    constructor(x, y, vel) {
        this.pos = createVector(x, y);
        this.vel = vel;
        this.lifespan = 255;
        this.decayRate = 10;
        this.size = random(width * 0.02, width * 0.05); // this shouldn't be hard coded!
        this.targetSize = random(width * 0.02, width * 0.05);
    }

    show() {
        noStroke();
        if (this.lifespan > 80) {
            push();
            fill(255, this.lifespan);

            let s = this.size / 4;
            let x = this.pos.x;
            let y = this.pos.y;

            translate(x, y);
            rotate(PI / 4);
            rect(0, 0, s, s);
            /* quad(
                 x, y - s,
                 x + s, y,
                 x, y + s,
                 x - s, y
             );
             */
            pop();
        }
    }

    setNewSize(newSize) {
        this.targetSize = newSize;
    }

    update() {
        this.pos.add(this.vel);
        this.vel.mult(0.9);
        this.vel.y -= 0.5;
        this.lifespan -= this.decayRate;
        this.size = this.size * .9;
        this.size += this.targetSize * .1;
    }

    isFinished() {
        return this.lifespan < 0;
    }
}