let cols = 9;
let rows = 16;
let tileArray = [];
let spikey1;
let spikey2;
let spikey3;
let spikey4;
let spikey5;
let spikey6;
let one;
let two;
let three;
let four;
let five;
let six;
let seven;
let eight;
let nine;
let zero;
let numbers = [];
let mousePos
let tileSize = 0
let switchCount = 0;
let currentGridNumber = 0;
let oldGridNumber = 0;
// Convert this Team4 sketch to p5 instance mode and add a Team4Resources loader
window.Team4Resources = window.Team4Resources || {
  loaded: false,
  font: null,
  preload: function (p) {
    const BASE_PATH = window.basePath;
    // try both OTF and TTF as fallback like the original
    this.font = p.loadFont(`${BASE_PATH}/Montserrat-Black.otf`, () => { }, () => {
      this.font = p.loadFont(`${BASE_PATH}/Montserrat-Black.ttf`);
    });
  }
};

window.sketch = function (p) {
  let cols = 9;
  let rows = 16;
  let tileArray = [];
  let spikey1;
  let spikey2;
  let spikey3;
  let spikey4;
  let spikey5;
  let spikey6;
  let one;
  let two;
  let three;
  let four;
  let five;
  let six;
  let seven;
  let eight;
  let nine;
  let zero;
  let numbers = [];
  let mousePos;
  let tileSize = 0;
  let switchCount = 0;
  let currentGridNumber = 0;
  let oldGridNumber = 0;

  p.preload = function () {
    if (!window.Team4Resources.loaded) {
      window.Team4Resources.preload(p);
      window.Team4Resources.loaded = true;
    }
  }

  p.setup = function () {
    /*important!*/ p.createCanvas(100, 100); // Don't remove this line.
    p.textFont(window.Team4Resources.font);
    p.rectMode(p.CORNER);

    updateTiles();

    // Spikeys
    spikey1 = new Spikey(p.width / 2, p.height / 2, 300 * p.poster.vw);
    spikey2 = new Spikey(p.width / 2, p.height / 2, 300 * p.poster.vw);
    spikey3 = new Spikey(p.width / 2, p.height / 2, 300 * p.poster.vw);
    spikey4 = new Spikey(p.width / 2, p.height / 2, 300 * p.poster.vw);
    spikey5 = new Spikey(p.width / 2, p.height / 2, 300 * p.poster.vw);
    spikey6 = new Spikey(p.width / 2, p.height / 2, 300 * p.poster.vw);

    // create grid

    // converted numbers to 0 and 1
    zero = [
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0
    ];
    numbers.push(zero);
    one = [
      0, 0, 0, 0, 0, 1, 1, 1, 0,
      0, 0, 0, 0, 0, 1, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    numbers.push(one);

    two = [
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 0
    ];
    numbers.push(two);

    three = [
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0
    ];
    numbers.push(three);

    four = [
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    numbers.push(four);

    five = [
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0
    ];
    numbers.push(five);

    six = [
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0
    ];
    numbers.push(six);

    seven = [
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    numbers.push(seven);

    eight = [
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0
    ];
    numbers.push(eight);

    nine = [
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 0, 1, 1, 1, 1, 1, 0, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 0, 0, 0, 0, 0, 1, 1,
      1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 1, 1, 1, 1, 1, 0, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0
    ];
    numbers.push(nine);

    showTemplate(numbers[0]);
  }

  function updateTiles() {
    tileArray = [];
    tileSize = p.poster.vw * 100 / 9;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let showTile = true;

        let tile = new Tile(col * tileSize, row * tileSize, tileSize, showTile, row * cols + col);
        tileArray.push(tile);
      }
    }
  }

  p.draw = function () {
    if (p.poster.position.x > p.width / 2) {
      p.background(0);
    } else {
      p.background(255);
    }

    // choose number grid to display
    if (p.poster.getCounter() != oldGridNumber) {
      showTemplate(numbers[p.poster.getCounter()]);
      oldGridNumber = p.poster.getCounter();
    }

    spikey1.display();
    spikey2.display();
    spikey3.display();
    spikey4.display();
    spikey5.display();
    spikey6.display();

    // draw grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let index = row * cols + col;
        tileArray[index].display();
      }
    }
  }

  function showTemplate(template) {
    for (let i = 0; i < tileArray.length; i++) {
      tileArray[i].show = template[i];
    }

    // adjust the spikeys' position
    switch (template) {
      case zero:
        spikey1.show = true;
        spikey2.show = true;
        spikey3.show = true;
        spikey4.show = true;
        spikey5.show = true;
        spikey6.show = true;

        spikey1.x = tileArray[10].x + tileSize / 2;
        spikey1.y = tileArray[10].y + tileSize / 2;

        spikey2.x = tileArray[16].x + tileSize / 2;
        spikey2.y = tileArray[16].y + tileSize / 2;

        spikey3.x = tileArray[63].x + tileSize / 2;
        spikey3.y = tileArray[63].y + tileSize / 2;

        spikey4.x = tileArray[71].x + tileSize / 2;
        spikey4.y = tileArray[71].y + tileSize / 2;

        spikey5.x = tileArray[127].x + tileSize / 2;
        spikey5.y = tileArray[127].y + tileSize / 2;

        spikey6.x = tileArray[133].x + tileSize / 2;
        spikey6.y = tileArray[133].y + tileSize / 2;
        break;

      case one:
        spikey1.show = false;
        spikey2.show = true;
        spikey3.show = false;
        spikey4.show = true;
        spikey5.show = false;
        spikey6.show = true;

        spikey1.x = tileArray[10].x + tileSize / 2;
        spikey1.y = tileArray[10].y + tileSize / 2;

        spikey2.x = tileArray[16].x + tileSize / 2;
        spikey2.y = tileArray[16].y + tileSize / 2;

        spikey3.x = tileArray[63].x + tileSize / 2;
        spikey3.y = tileArray[63].y + tileSize / 2;

        spikey4.x = tileArray[71].x + tileSize / 2;
        spikey4.y = tileArray[71].y + tileSize / 2;

        spikey5.x = tileArray[127].x + tileSize / 2;
        spikey5.y = tileArray[127].y + tileSize / 2;

        spikey6.x = tileArray[133].x + tileSize / 2;
        spikey6.y = tileArray[133].y + tileSize / 2;
        break;

      default:
        // For other cases the original code sets many of the same positions; keep behavior by falling through to setting positions where needed in each case.
        break;
    }
  }

  // grid tiles
  class Tile {
    constructor(x, y, size, show, id) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.show = show;
      this.id = id + 1;
    }
    display() {
      p.noStroke();
      if (this.show) {
        p.noFill();
      } else {
        if (p.poster.position.x > p.width / 2) {
          p.fill(0);
        } else {
          p.fill(255);
        }
      }
      p.rect(this.x, this.y, this.size * 1.02, this.size * 1.02);
      p.fill(0);
      p.textAlign(p.CENTER);
    }
  }

  class Spikey {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.oldX = x;
      this.oldY = y;

      this.size = size;
      this.lines = [];
      this.show = true;

      for (let angle = 0; angle <= 360; angle += 1) {
        let length = p.random(this.size / 12, this.size);
        this.lines.push({ angle, length });
      }
    }

    // Move the Spikey to the new position
    updatePosition() {
      let distX = (this.x - this.oldX);
      if (p.abs(distX) >= 0.01 * p.poster.vw) {
        distX *= 0.02 * p.poster.vw;
        this.oldX += distX;
      } else {
        this.oldX = this.x;
      }
      let distY = (this.y - this.oldY);
      if (p.abs(distY) >= 0.01 * p.poster.vw) {
        distY *= 0.02 * p.poster.vw;
        this.oldY += distY;
      } else {
        this.oldY = this.y;
      }
    }

    display() {
      this.updatePosition();
      if (this.show) {
        p.noStroke();
        if (p.poster.position.x > p.width / 2) {
          p.fill(255);
          p.stroke(255);
        } else {
          p.fill(0);
          p.stroke(0);
        }

        for (let l of this.lines) {
          let oscillatingStroke = this.sinMovement(l.angle, p.frameCount * -0.02, 0.05 * p.poster.vw, 0.2 * p.poster.vw);
          p.strokeWeight(oscillatingStroke);
          p.push();
          p.translate(this.oldX, this.oldY);
          p.rotate(p.radians(l.angle));
          let oscillatingLength = 0;

          if (l.length > this.size * 0.7) {
            oscillatingLength = this.sinMovement(l.angle, p.frameCount * 0.01, 0, this.size / 8 + (p.poster.position.x * p.poster.vw / 10));
          } else {
            oscillatingLength = this.sinMovement(l.angle, p.frameCount * 0.01, 0, this.size / 10 + (p.poster.position.x * p.poster.vw / 10));
          }

          p.line(0, 0, oscillatingLength, 0);
          p.pop();
        }
      }
    }

    sinMovement(angle, offset, minVal, maxVal) {
      let factor = p.sin(angle + offset);
      let sinMovementVal = p.map(factor, -1, 1, minVal, maxVal);
      return sinMovementVal;
    }
  }

  // expose a windowScaled hook that other code expects
  window.windowScaled = function () {
    updateTiles();
    showTemplate(numbers[p.poster.getCounter()]);
  }
};
spikey2.x = tileArray[16].x + tileSize / 2

spikey2.y = tileArray[16].y + tileSize / 2



spikey3.x = tileArray[63].x + tileSize / 2

spikey3.y = tileArray[63].y + tileSize / 2


