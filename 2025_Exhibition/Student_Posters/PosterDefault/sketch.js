
let rotationHistory = [];
let font;
function preload() {  
  // load the font
  font = loadFont('barlow_condensed.otf');
  
}
function setup() {
  createCanvas(100, 100); 
 /* poster.setup(this, "models/movenet/model.json"); */ // Don't remove this line. 
 //textAlign(CENTER, CENTER);
  textFont(font);
  //poster = new poster();
}

function draw() {
  background(0,0,0);
  fill(255,255,100);
  wordEffect(poster.getCounter(), width / 2, height / 2); 
}

function windowResized() { // this is a custom event called whenever the poster is scaled
  textSize(10 * poster.vw);
}

function wordEffect(word, x, y) {

  let size = 1;
  push()
  translate(x, y)
  let rotation = (-PI * 0.25) + (poster.posNormal.x * 0.5 * PI)
  // find the center point of the textObject
  let maxSteps = 40;
  let maxSize = 600 * poster.vw
  let minSize = 80 * poster.vw
  let stepSize = abs(maxSize- minSize) / maxSteps;
  let colorStep = (255 / maxSteps);
  textSize(minSize);
 // translate((-(bbox.x)/2)-(bbox.w/2), (-(bbox.y)/2)+(bbox.h/2));

  // the background letters 
  for (let i = 0; i < rotationHistory.length; i++) {
    fill(colorStep*i);
    push()  
    
    rotate(rotationHistory[i].rotation);
    size = maxSize-(stepSize*(i)) + Math.min(maxSize,minSize);
    textSize(size);
    let bbox = font.textBounds(rotationHistory[i].char, 0, 0);
    translate((-(bbox.x)/2)-(bbox.w/2), +(bbox.h/2));
    text(rotationHistory[i].char, 0, 0)
    pop();
  }

  rotate(rotation);
  historyObject = {rotation: rotation, char: ""+word}
  textSize(minSize);
  let bbox = font.textBounds(""+word, 0, 0,);
  translate((-(bbox.x)/2)-(bbox.w/2), +(bbox.h/2));
  rotationHistory.push(historyObject);
  //rect(bbox.x, bbox.y, bbox.w, bbox.h);
  pop();
  if (rotationHistory.length > maxSteps) {
    rotationHistory.shift();
  }
  noFill();
}






