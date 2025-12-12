let img;
let barGif;
let step = 10;
const charas = [".", "-", "+", "x", "#", "!", "@"];

// Digit images
let digitsD0_d = []; // animation frames 0-1
let digitsD1_d = []; // animation frames 1-2
let digitsD2_d = []; // animation frames 2-3
let digitsD3_d = []; // animation frames 3-4
let digitsD4_d = []; // animation frames 4-5
let digitsD5_d = []; // animation frames 5-6
let digitsD6_d = []; // animation frames 6-7
let digitsD7_d = []; // animation frame 7-8
let digitsD8_d = []; // animation frames 8-9
let digitsD9_d = []; // animation frames 9-0

// Animation variables
let currentAnimationFrame = 1;
let animationSpeed = 8;
let frameCounter = 0;
let currentDigitArray = [];
let currentCounter = -1;
let animationCompleted = false;

// ASCII caching
let cachedAscii;
let cachedForImage = null;
let cachedForFrame = -1;

function preload() {
  for (let i = 1; i <= 9; i++) {
    digitsD0_d[i] = loadImage("imgs/d0_d" + i + ".png");
    digitsD1_d[i] = loadImage("imgs/d1_d" + i + ".png");
    digitsD2_d[i] = loadImage("imgs/d2_d" + i + ".png");
    digitsD3_d[i] = loadImage("imgs/d3_d" + i + ".png");
    digitsD4_d[i] = loadImage("imgs/d4_d" + i + ".png");
    digitsD5_d[i] = loadImage("imgs/d5_d" + i + ".png");
    digitsD6_d[i] = loadImage("imgs/d6_d" + i + ".png");
    digitsD7_d[i] = loadImage("imgs/d7_d" + i + ".png");
    digitsD8_d[i] = loadImage("imgs/d8_d" + i + ".png");
    digitsD9_d[i] = loadImage("imgs/d9_d" + i + ".png");
  }
  barGif = loadImage("imgs/bar-try.gif");
  // prebuffer 
}
function setup() {
  createCanvas(100, 100);
  // pixelDensity(1);
  noSmooth();
  noStroke();
  step = floor(height * 0.02);
  textSize(step);
  textAlign(CENTER, CENTER);
}
function windowResized() {
  step = floor(height * 0.02);
  textSize(step);
}

function draw() {
  background(0);

  let counter = poster.getCounter();

  // Check if counter has changed
  if (counter !== currentCounter) {
    currentCounter = counter;
    currentAnimationFrame = 1; // Start at frame 1
    frameCounter = 0;
    animationCompleted = false;
    cachedAscii = null; // Reset cache

    // Correct counter mapping
    // If counter is X, show transition TO X (not FROM X)
    switch (counter) {
      case 9:
        currentDigitArray = digitsD8_d; // 8→9 transition
        break;
      case 8:
        currentDigitArray = digitsD7_d; // 7→8 transition
        break;
      case 7:
        currentDigitArray = digitsD6_d; // 6→7 transition
        break;
      case 6:
        currentDigitArray = digitsD5_d; // 5→6 transition
        break;
      case 5:
        currentDigitArray = digitsD4_d; // 4→5 transition
        break;
      case 4:
        currentDigitArray = digitsD3_d; // 3→4 transition
        break;
      case 3:
        currentDigitArray = digitsD2_d; // 2→3 transition
        break;
      case 2:
        currentDigitArray = digitsD1_d; // 1→2 transition
        break;
      case 1:
        currentDigitArray = digitsD0_d; // 0→1 transition
        break;
      case 0:
        currentDigitArray = digitsD9_d; // 9→0 transition
        break;
      default:
        currentDigitArray = [];
    }
  }

  // Only proceed if we have a valid array
  if (currentDigitArray.length > 0) {
    // Update animation frame if not completed
    if (!animationCompleted) {
      frameCounter++;
      if (frameCounter >= animationSpeed) {
        frameCounter = 0;
        currentAnimationFrame++;

        // Stay on last frame instead of disappearing
        if (currentAnimationFrame > 9) {
          currentAnimationFrame = 9;
          animationCompleted = true;
        }
        // Regenerate ASCII
        cachedAscii = null;
      }
    }

    img = currentDigitArray[currentAnimationFrame];
    asciiEffect(img, currentAnimationFrame);
  }
  oppositeMirror();
}

function asciiEffect(frameImg, frameIndex) {
  // Use cached ascii image
  if (
    cachedForImage === frameImg &&
    cachedForFrame === frameIndex &&
    cachedAscii
  ) {
    image(cachedAscii, 0, 0, width, height);
    return;
  }

  // Create buffer
  let pg = createGraphics(width, height);
  pg.noSmooth();
  pg.background(0);
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  pg.textSize(step * 0.7);

  let scaleFactor = min(width / frameImg.width, height / frameImg.height);
  let scaledWidth = frameImg.width * scaleFactor;
  let scaledHeight = frameImg.height * scaleFactor;
  let offsetX = (width - scaledWidth) / 2;
  let offsetY = (height - scaledHeight) / 2;

  frameImg.loadPixels();

  for (let x = 0; x < scaledWidth; x += step) {
    for (let y = 0; y < scaledHeight; y += step) {
      let imgX = floor(map(x, 0, scaledWidth, 0, frameImg.width));
      let imgY = floor(map(y, 0, scaledHeight, 0, frameImg.height));
      let idx = (imgY * frameImg.width + imgX) * 4;
      let r = frameImg.pixels[idx];
      let g = frameImg.pixels[idx + 1];
      let b = frameImg.pixels[idx + 2];
      let avg = (r + g + b) / 3;

      let charIndex = round(map(avg, 0, 255, charas.length - 1, 0));
      charIndex = constrain(charIndex, 0, charas.length - 1);
      pg.text(
        charas[charIndex],
        offsetX + x + step / 2,
        offsetY + y + step / 2
      );
    }
  }

  cachedAscii = pg.get();
  cachedForImage = frameImg;
  cachedForFrame = frameIndex;

  image(cachedAscii, 0, 0, width, height);
}

function oppositeMirror() {
  let canvasX = poster.position.x;
  let tenth = width / 10;
  let maxRectWidth = poster.vw * 55;
  let rectWidth = maxRectWidth;

  if (canvasX <= 0) {
    rectWidth = 0;
  } else if (canvasX < tenth) {
    rectWidth = map(canvasX, 0, tenth, 0, maxRectWidth);
  } else if (canvasX >= width) {
    rectWidth = 0;
  } else if (canvasX > width - tenth) {
    rectWidth = map(canvasX, width - tenth, width, maxRectWidth, 0);
  }
  rectWidth = max(0, rectWidth);

  if (rectWidth > 0) {
    push();
    blendMode(EXCLUSION);
    image(barGif, canvasX, 0, rectWidth, poster.vh * 120);
    pop();
  }
}
