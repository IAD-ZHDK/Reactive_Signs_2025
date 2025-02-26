let font;
function preload() {  
  // load the font
  font = loadFont('barlow_condensed.otf');
}
function setup() {
  createCanvas(100,100); // poster is resized automatically
  textSize(120 * poster.vw);
  textFont(font);
  strokeWeight(3)
}

function draw() {
  background(0, 0, 0, 20);
  fill(255);
  wordEffect(poster.getCounter(), width / 2, height / 2);
}

function windowResized() {
  textSize(120 * poster.vw);
}

function wordEffect(number, x, y) {
  push()
    translate(x, y)
    let rotation = (-PI * 0.25) + (poster.posNormal.x * 0.5 * PI)
    rotate(rotation);
    // The textBounds function returns the bounding box of the text.
    // This can be very useful when you need to precisely position text.
    let bbox = font.textBounds(""+number, 0, 0,);
    translate((-(bbox.x)/2)-(bbox.w/2), +(bbox.h/2));
    // uncommment the following line to see the bounding box
    
   
    text(""+number, 0, 0)
    noFill();
    stroke(255,0,0)
    rect(bbox.x, bbox.y, bbox.w, bbox.h);
  pop();
}






