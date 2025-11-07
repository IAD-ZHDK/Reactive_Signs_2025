
let rotationHistory = [];


let digitGraphics = {}; // Store pre-rendered digits
let currentMillis = 0;
let lastmillis = 0;
let font;
function preload() {
  // load the font
  font = loadFont('barlow_condensed.otf');
}
function setup() {
  createCanvas(100, 100, WEBGL);
  //textAlign(CENTER, CENTER);
  textFont(font);
  frameRate(60);
  // Pre-render all digits 0-9
  preRenderDigits();
}

function draw() {
  background(0, 0, 0);
  fill(255, 255, 100);
  /*
  let data = digitGraphics[poster.getCounter()];
  if (data) {
    console.log(data.w);
    image(data.graphic, -data.graphic.width / 2, -data.graphic.height / 2);
  }
*/
  wordEffect(poster.getCounter(), 0, 0);
  // wordEffect(poster.getCounter(), 0, 0);
}

function preRenderDigits() {
  let size = 100 * poster.vw; // Base size for rendering digits, impacts resolution
  for (let digit = 0; digit <= 9; digit++) {
    let char = "" + digit;
    textSize(size); // Use same size as minSize
    let bbox = font.textBounds(char, 0, 0);

    // Create graphics buffer for this digit
    let outsideOffset = 5; // extra space around the character incase texbounds is off
    let g = createGraphics(bbox.w + outsideOffset, bbox.h + outsideOffset);
    g.textFont(font);
    g.fill(255);
    g.textSize(size); // Use same size as minSize
    let x = (-(bbox.x));
    let y = (bbox.h / 2) - (bbox.y) / 2;
    g.text(char, x, y);
    digitGraphics[digit] = { graphic: g, bbox: bbox };
    console.log("bbox.x:", bbox.x, " bbox.y:", bbox.y);
  }
}

function windowResized() { // this is a custom event called whenever the poster is scaled
  preRenderDigits();
}

function wordEffect(word, x, y) {
  push()
  translate(x, y)
  let rotation = (-PI * 0.25) + (poster.posNormal.x * 0.5 * PI)
  let maxSteps = 40;
  let maxSize = 80 * poster.vw
  let minSize = 10 * poster.vw
  let stepSize = abs(maxSize - minSize) / maxSteps;
  let colorStep = (255 / maxSteps);

  // the background letters 
  for (let i = 0; i < rotationHistory.length; i++) {

    push()
    rotate(rotationHistory[i].rotation);

    let data = digitGraphics[rotationHistory[i].char];
    let fontW = data.graphic.width;
    let fontH = data.graphic.height;
    let size = maxSize - (stepSize * (i));
    //let size =
    scale(size / (minSize)); // Scale pre-rendered graphic


    if (data) {
      translate(-(fontW / 2), -(fontH / 2));
      tint(colorStep * i, 255);
      image(data.graphic, 0, 0);
    }
    pop();
  }

  rotate(rotation);

  historyObject = { rotation: rotation, char: "" + word }
  rotationHistory.push(historyObject);

  pop();

  if (rotationHistory.length > maxSteps) {
    rotationHistory.shift();
  }
}




