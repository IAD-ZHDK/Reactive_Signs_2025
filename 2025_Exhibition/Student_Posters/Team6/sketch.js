
let blobs = [];
let backgroundBlobs = [];
let blobCount = 600;
let radius = 12;
let stiffness = 0.03;
let damping = 0.9;
let mouseForce = 0.01;
let numbers = [];
let currentNumber = 9;
let nextNumber = 9;
let morphProgress = 0;
let lastNumber = 3;
let countdownTimer;
let font;


function preload() {
  font = loadFont('RuderPlakatLLVIP.ttf'); // Load any font
}
let bounds;

function setup() {
  createCanvas(100, 100);
  textSize(poster.vh * 90);
  textAlign(CENTER, CENTER);
  setupAllBLobs();
  countdownTimer = millis();
}

function setupAllBLobs() {
  blobs = [];
  backgroundBlobs = [];
  numbers = [];
  // Generate blob patterns for numbers 9 to 0
  for (let i = 9; i >= 0; i--) {
    numbers[i] = createBlobPattern(i.toString(), poster.vw * 50, poster.vh * 50);
  }

  // Initialize blobs for the first number
  initializeBlobs(numbers[currentNumber]);

  // Generate random background blobs
  for (let i = 0; i < blobCount; i++) {
    let randomX = random(poster.vw * 100);
    let randomY = random(poster.vh * 100);
    let randomRadius = random(poster.vh * 1.5, poster.vh * 9);

    /*

    for (let i = 0; i < blobs.length; i++) {
      let distance = dist(randomX, randomY, blobs[i].current.x, blobs[i].current.y);
      if (distance < randomRadius + blobs[i].radius) {
        randomX = random(width);
        randomY = random(height);
      }
    }
      */
    backgroundBlobs.push(new Blob(randomX, randomY, randomRadius, color(random(0), 30)));


  }


}

function draw() {
  background(200);

  if (!poster.tracking) {
    //  poster.position.x = 0;
  }
  //stroke(0);
  // Draw background blobs

  if (!poster.tracking) {
    //  poster.position.x = 0; // Move tracking point to the far left
  }

  for (let blob of backgroundBlobs) {
    blob.update();
    blob.display();
  }


  // Countdown logic

  if (nextNumber != poster.getCounter()) {
    // = millis();
    currentNumber = nextNumber;
    nextNumber = poster.getCounter();
    morphProgress = 0;
  }

  morphBlobs(numbers[currentNumber], numbers[nextNumber]);

  // Display and update blobs

  for (let blob of blobs) {
    blob.update();
    blob.display();
  }


}

function createBlobPattern(txt, x, y) {
  textSize(poster.vh * 90); //change font size
  bounds = font.textBounds(txt, x, y);

  // Start with a base sampleFactor
  let baseSampleFactor = 0.1;

  // Custom sample factors for specific numbers
  let sampleFactors = {
    '0': 0.1,
    '1': 0.19,
    '2': 0.13,
    '3': 0.1,
    '4': 0.12,
    '5': 0.1,
    '6': 0.09,
    '7': 0.16,
    '8': 0.1,
    '9': 0.13
  };

  // Use custom sample factor if defined, otherwise use base
  let sampleFactor = sampleFactors[txt] || baseSampleFactor;

  let pts = font.textToPoints(txt, (poster.vw * 66.6) - (bounds.w / 4), (poster.vh * 20) + (bounds.h / 4), poster.vh * 90, {
    sampleFactor: sampleFactor,
    simplifyThreshold: 0.0,
  });

  // Optional: Limit total number of points if needed
  const MAX_POINTS = 900;
  if (pts.length > MAX_POINTS) {
    // Randomly sample points if we have too many
    pts = pts.sort(() => 0.5 - Math.random()).slice(0, MAX_POINTS);
  }

  if (txt == "9") {
    for (let i = 0; i < 50; i++) {
      pts.push({ x: random(poster.vw * 100), y: random(poster.vh * 100) })
    }
  }

  return pts.map((pt) => createVector(pt.x, pt.y));
}

function initializeBlobs(points) {
  blobs = [];
  for (let pt of points) {
    let randomRadius = random(poster.vh, poster.vh * 2);
    blobs.push(new Blob(pt.x, pt.y, randomRadius, color(random(200, 250), 150)));
  }
}

function morphBlobs(current, next) {
  morphProgress = constrain(morphProgress + 0.2, 0, 1);

  if (current.length !== next.length) {
    // add random points to the shorter array
    let maxLength = max(current.length, next.length);
    for (let i = current.length; i < maxLength; i++) current.push(createVector(random(width), random(height)));
    for (let i = next.length; i < maxLength; i++) next.push(createVector(random(width), random(height)));
  }

  for (let i = 0; i < blobs.length; i++) {
    let target = next[i] || createVector(random(width), random(height));
    blobs[i].morphTo(
      lerp(current[i].x, target.x, morphProgress),
      lerp(current[i].y, target.y, morphProgress)
    );
  }
}

class Blob {
  constructor(x, y, radius, myColor) {
    this.current = createVector(x, y);
    this.original = createVector(x, y);
    this.radius = radius; //random(10, 18);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.color = myColor; //color(random(200), 200);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  morphTo(x, y) {
    this.original.set(x, y);
  }

  update() {

    let springForce = this.original.copy().sub(this.current).mult(stiffness);

    //let springForce = p5.Vector.sub(this.original, this.current).mult(stiffness);
    this.applyForce(springForce);

    let mouseVec = createVector(poster.position.x, poster.position.y);
    let distance = dist(poster.position.x, poster.position.y, this.current.x, this.current.y);
    if (distance < height / 2 && poster.position.x >= 10 * poster.vw && poster.position.x <= 90 * poster.vw && poster.position.y >= 10 * poster.vh && poster.position.y <= 90 * poster.vh) {
      let force = mouseForce * (height / 2 - distance)
      let repulsion = this.current.copy().sub(mouseVec).setMag(force);
      //let repulsion = p5.Vector.sub(this.current, mouseVec).setMag(force);
      this.applyForce(repulsion);
    }

    this.velocity.add(this.acceleration);
    this.velocity.mult(damping);
    this.current.add(this.velocity);

    this.acceleration.mult(0);
  }


  display() {
    fill(this.color);
    noStroke();
    ellipse(this.current.x, this.current.y, this.radius * 2, this.radius * 2);
  }
}

function windowResized() { // this is a custom event called whenever the poster is scaled
  // textSize(10 * poster.vw);
  setupAllBLobs()
  console.log("resized screen ")
}
  