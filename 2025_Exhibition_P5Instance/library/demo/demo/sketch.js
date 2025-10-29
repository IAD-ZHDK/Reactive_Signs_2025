// Convert demo sketch to p5 instance mode
let sketch = function (p) {
  let font;

  p.preload = function () {
    // load the font
    font = p.loadFont('barlow_condensed.otf');
  };

  p.setup = function () {
    p.createCanvas(100, 100); // poster is resized automatically
    p.textSize(120 * p.poster.vw);
    p.textFont(font);
    p.strokeWeight(3);
  };

  p.draw = function () {
    p.background(100, 0, 0, 20);
    p.fill(255);
    console.log(p.poster.getCounter());
    wordEffect(p.poster.getCounter(), p.width / 2, p.height / 2);
  };

  p.windowResized = function () {
    p.textSize(120 * p.poster.vw);
  };

  function wordEffect(number, x, y) {
    p.push();
    p.translate(x, y);
    // p5 instance-safe references
    const rotation = (-p.PI * 0.25) + (p.poster.posNormal.x * 0.5 * p.PI);
    p.rotate(rotation);
    // The textBounds function returns the bounding box of the text.
    const bbox = font.textBounds("" + number, 0, 0);
    p.translate((-(bbox.x) / 2) - (bbox.w / 2), +(bbox.h / 2));

    p.text("" + number, 0, 0);
    p.noFill();
    p.stroke(255, 255, 0);
    p.rect(bbox.x, bbox.y, bbox.w, bbox.h);
    p.pop();
  }

};

//let myp5 = new p5(sketch, 'demo-container');






