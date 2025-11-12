
let blobs = [];
let backgroundBlobs = [];
let blobCount = 600;
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
  let numberWithMostPoints = 9;
  let MIN_POINTS = 2000;
  let MAX_POINTS = 0;
  let pointCounts = [];

  for (let i = 9; i >= 0; i--) {
    numbers[i] = createBlobPattern(i.toString(), poster.vw * 50, poster.vh * 50);
    pointCounts.push(numbers[i].length);
    if (numbers[i].length > MAX_POINTS) {
      numberWithMostPoints = i;
      MAX_POINTS = numbers[i].length;
    }
    if (numbers[i].length < MIN_POINTS) {
      MIN_POINTS = numbers[i].length;
    }
    console.log(`Number ${i} has ${numbers[i].length} points.`);
  }
  let MEAN_POINTS = (MAX_POINTS + MIN_POINTS) / 2;
  pointCounts.sort((a, b) => a - b);
  let MEDIAN_POINTS = pointCounts[Math.floor(pointCounts.length / 2)];

  console.log(`Max points: ${MAX_POINTS}, Min points: ${MIN_POINTS}, Mean points: ${MEAN_POINTS}, Median points: ${MEDIAN_POINTS}`);

  for (let i = 9; i >= 0; i--) {

    if (numbers[i].length > MEDIAN_POINTS) {
      // reduce points
      numbers[i] = numbers[i].sort(() => 0.5 - Math.random()).slice(0, MEDIAN_POINTS);
    }
    if (numbers[i].length <= MEDIAN_POINTS) {
      // add points
      for (let t = numbers[i].length; t < MAX_POINTS; t++) {
        numbers[i].push(createVector(random(width), random(height), random(poster.vh * 0.5, poster.vh * 1.1)));
      }
      //numbers[i] = numbers[i].sort(() => 0.5 - Math.random()).slice(0, MIN_POINTS);
    }
  }


  // Optional: Limit total number of points if needed



  // Initialize blobs for the number with most points
  initializeBlobs(numbers[9]);


  // Generate random background blobs
  for (let i = 0; i < blobCount; i++) {
    let randomX = random(poster.vw * 100);
    let randomY = random(poster.vh * 100);
    let randomRadius = random(poster.vh * 3, poster.vh * 18);

    /*

    for (let i = 0; i < blobs.length; i++) {
      let distance = dist(randomX, randomY, blobs[i].current.x, blobs[i].current.y);
      if (distance < randomRadius + blobs[i].radius) {
        randomX = random(width);
        randomY = random(height);
      }
    }
      */
    backgroundBlobs.push(new Blob(randomX, randomY, randomRadius, color(random(10), 60)));
  }

  console.log("background blobs created: " + backgroundBlobs.length);


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
  //textSize(poster.vh * 90); //change font size
  let fontSize = 800; // this impacts the number of ponts, but not the visible size on screen
  textSize(fontSize); //change font size
  bounds = font.textBounds(txt, x, y);

  // Start with a base sampleFactor
  let baseSampleFactor = 0.1;

  let bbox = font.textBounds(txt, x, y);
  //rect(bbox.x, bbox.y, bbox.w, bbox.h);

  // Custom sample factors for specific numbers
  let sampleFactors = {
    '0': 0.1,
    '1': 0.19,
    '2': 0.23,
    '3': 0.1,
    '4': 0.12,
    '5': 0.1,
    '6': 0.09,
    '7': 0.16,
    '8': 0.1,
    '9': 0.12
  };

  // Use custom sample factor if defined, otherwise use base
  let sampleFactor = sampleFactors[txt] || baseSampleFactor;

  let pts = font.textToPoints(txt, x, y, fontSize, {
    sampleFactor: sampleFactor,
    simplifyThreshold: 0.00,
  });

  /*
  if (pts.length > MAX_POINTS) {
      // Randomly sample points if we have too many
      pts = pts.sort(() => 0.5 - Math.random()).slice(0, MAX_POINTS);
    }
  */
  // scale points to fit poster size based on bbox
  // Use height-based scaling to maintain original proportions
  let scale = (poster.vh * 100) / bbox.h * 0.7; // 70% of height

  pts = pts.map((pt) => {
    return {
      x: pt.x * scale,
      y: pt.y * scale,
    };
  });

  // move to center after scaling 
  let offsetX = (poster.vw * 100 - bbox.w * scale) / 2 - bbox.x * scale;
  let offsetY = (poster.vh * 100 - bbox.h * scale) / 2 - bbox.y * scale;

  pts = pts.map((pt) => {
    return {
      x: pt.x + offsetX,
      y: pt.y + offsetY,
    };
  });
  return pts.map((pt) => createVector(pt.x, pt.y, random(poster.vh * 2, poster.vh * 4)));
}

function initializeBlobs(points) {
  blobs = [];
  for (let pt of points) {
    // console.log(pt);
    blobs.push(new Blob(pt.x, pt.y, pt.z, color(random(200, 250), 150)));
  }
}

function morphBlobs(current, next) {
  morphProgress = constrain(morphProgress + 0.2, 0, 1);
  /*
    if (current.length !== next.length) {
      // add random points to the shorter array
      let maxLength = max(current.length, next.length);
      for (let i = current.length; i < maxLength; i++) current.push(createVector(random(width), random(height)));
      for (let i = next.length; i < maxLength; i++) next.push(createVector(random(width), random(height)));
    }
  */
  for (let i = 0; i < blobs.length; i++) {
    // Ensure current and next arrays have enough elements for all blobs
    let currentPos = current[i] || createVector(random(width), random(height), random(poster.vh, poster.vh * 0.5));
    let target = next[i] || createVector(random(width), random(height), random(poster.vh, poster.vh * 0.5));

    blobs[i].morphTo(
      lerp(currentPos.x, target.x, morphProgress),
      lerp(currentPos.y, target.y, morphProgress),
      lerp(currentPos.z, target.z, morphProgress)
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

  morphTo(x, y, z) {
    this.original.set(x, y, z);
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
    circle(this.current.x, this.current.y, this.radius);
  }
}

function windowResized() { // this is a custom event called whenever the poster is scaled
  // textSize(10 * poster.vw);
  setupAllBLobs()
  console.log("resized screen ")
}
