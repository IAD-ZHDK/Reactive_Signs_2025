window.sketch = function(p) {
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
  let bounds;

  p.preload = function() {
    font = p.loadFont('RuderPlakatLLVIP.ttf');
  };

  p.setup = function() {
    p.createCanvas(100, 100);
    p.textSize(poster.vh * 90);
    p.textAlign(p.CENTER, p.CENTER);
    setupAllBLobs();
    countdownTimer = p.millis();
  };

  function setupAllBLobs() {
    blobs = [];
    backgroundBlobs = [];
    numbers = [];
    for (let i = 9; i >= 0; i--) {
      numbers[i] = createBlobPattern(i.toString(), poster.vw * 50, poster.vh * 50);
    }
    initializeBlobs(numbers[currentNumber]);
    for (let i = 0; i < blobCount; i++) {
      let randomX = p.random(poster.vw * 100);
      let randomY = p.random(poster.vh * 100);
      let randomRadius = p.random(poster.vh * 1.5, poster.vh * 9);
      backgroundBlobs.push(new Blob(randomX, randomY, randomRadius, p.color(p.random(0), 30)));
    }
  }
  // ...rest of the code, convert all global functions to local and prefix p. for p5.js calls...
};
