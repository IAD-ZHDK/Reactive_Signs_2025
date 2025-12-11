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

function preload() {
  font = loadFont("Montserrat-Black.otf");
  font = loadFont("Montserrat-Black.ttf"); // fallback font
}

function setup() {
  createCanvas(100, 100);
  textFont(font);
  rectMode(CORNER);

  updateTiles();

  // Spikeys
  spikey1 = new Spikey(width / 2, height / 2, 300 * poster.vw);
  spikey2 = new Spikey(width / 2, height / 2, 300 * poster.vw);
  spikey3 = new Spikey(width / 2, height / 2, 300 * poster.vw);
  spikey4 = new Spikey(width / 2, height / 2, 300 * poster.vw);
  spikey5 = new Spikey(width / 2, height / 2, 300 * poster.vw);
  spikey6 = new Spikey(width / 2, height / 2, 300 * poster.vw);

  // create grid

  // converted numbers to 0 and 1
  zero = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0,
    1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0,
    0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(zero);
  one = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(one);

  two = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(two);

  three = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(three);

  four = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1,
    0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0,
    1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(four);

  five = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(five);

  six = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0,
    0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(six);

  seven = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(seven);

  eight = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0,
    1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0,
    0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(eight);

  nine = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0,
    1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  numbers.push(nine);

  showTemplate(numbers[0]);
}

function updateTiles() {
  tileArray = [];
  tileSize = (poster.vw * 100) / 9;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let showTile = true;

      let tile = new Tile(
        col * tileSize,
        row * tileSize,
        tileSize,
        showTile,
        row * cols + col
      );
      tileArray.push(tile);
    }
  }
}

function draw() {
  background(0);

  // If an external normalized x-value is provided as `mousePosExternal` (0..1),
  // prefer it. Otherwise map the actual mouseX to 0..1. This allows programmatic
  // control of the thickness tiers.
  if (typeof mousePosExternal === "number") {
    mousePos = constrain(mousePosExternal, 0, 1);
  } else {
    mousePos = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
  }

  /*
  switchCount++
  if (switchCount > 300) {
    currentGridNumber++;
    switchCount = 0
    if (currentGridNumber > 9) {
      currentGridNumber = 0
    }
  }
*/

  // choose number grid to display
  if (poster.getCounter() != oldGridNumber) {
    showTemplate(numbers[poster.getCounter()]);
    oldGridNumber = poster.getCounter();
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
      // console.log(tileArray[index])
      tileArray[index].display();
    }
  }
}

function showTemplate(template) {
  for (let i = 0; i < tileArray.length; i++) {
    // get true or false value from the digit template and apply to Tiles
    tileArray[i].show = template[i];
  }

  // adjust the spikeys' position
  switch (template) {
    case zero:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = false;
      spikey4.show = false;
      spikey5.show = true;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[24].x + tileSize;
      spikey2.y = tileArray[24].y;

      spikey3.x = -width;
      spikey3.y = tileArray[56].y + tileSize;

      spikey4.x = +width * 2;
      spikey4.y = tileArray[56].y + tileSize;

      spikey5.x = tileArray[119].x;
      spikey5.y = tileArray[119].y + tileSize;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    case one:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = false;
      spikey4.show = false;
      spikey5.show = false;
      spikey6.show = true;

      spikey1.x = tileArray[12].x;
      spikey1.y = tileArray[12].y + tileSize;

      spikey2.x = tileArray[15].x + tileSize;
      spikey2.y = tileArray[15].y + tileSize;

      spikey3.x = tileArray[63].x - width;
      spikey3.y = tileArray[63].y;

      spikey4.x = tileArray[71].x + width;
      spikey4.y = tileArray[71].y;

      spikey5.x = tileArray[118].x - width;
      spikey5.y = tileArray[118].y;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    case two:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = true;
      spikey4.show = true;
      spikey5.show = true;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[24].x + tileSize;
      spikey2.y = tileArray[24].y;

      spikey3.x = tileArray[65].x;
      spikey3.y = tileArray[65].y;

      spikey4.x = tileArray[78].x + tileSize;
      spikey4.y = tileArray[78].y + tileSize;

      spikey5.x = tileArray[119].x;
      spikey5.y = tileArray[119].y + tileSize;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    case three:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = true;
      spikey4.show = false;
      spikey5.show = true;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[24].x + tileSize;
      spikey2.y = tileArray[24].y;

      spikey3.x = tileArray[74].x;
      spikey3.y = tileArray[74].y;

      spikey4.x = width * 2;
      spikey4.y = tileArray[74].y + tileSize;

      spikey5.x = tileArray[119].x;
      spikey5.y = tileArray[119].y + tileSize;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    case four:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = true;
      spikey4.show = false;
      spikey5.show = false;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[24].x + tileSize;
      spikey2.y = tileArray[24].y;

      spikey3.x = tileArray[74].x;
      spikey3.y = tileArray[74].y + tileSize;

      spikey4.x = width * 2;
      spikey4.y = tileArray[74].y + tileSize;

      spikey5.x = tileArray[119].x;
      spikey5.y = tileArray[119].y + tileSize;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    case five:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = true;
      spikey4.show = true;
      spikey5.show = true;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[24].x + tileSize;
      spikey2.y = tileArray[24].y;

      spikey3.x = tileArray[74].x;
      spikey3.y = tileArray[74].y + tileSize;

      spikey4.x = tileArray[69].x + tileSize;
      spikey4.y = tileArray[69].y;

      spikey5.x = tileArray[119].x;
      spikey5.y = tileArray[119].y + tileSize;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    case six:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = false;
      spikey4.show = true;
      spikey5.show = true;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[24].x + tileSize;
      spikey2.y = tileArray[24].y;

      spikey3.x = -width * 2;
      spikey3.y = tileArray[74].y + tileSize;

      spikey4.x = tileArray[69].x + tileSize;
      spikey4.y = tileArray[69].y;

      spikey5.x = tileArray[119].x;
      spikey5.y = tileArray[119].y + tileSize;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    case seven:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = true;
      spikey4.show = true;
      spikey5.show = false;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[23].x + tileSize;
      spikey2.y = tileArray[23].y;

      spikey3.x = tileArray[66].x;
      spikey3.y = tileArray[66].y + tileSize;

      spikey4.x = tileArray[69].x + tileSize;
      spikey4.y = tileArray[69].y + tileSize;

      spikey5.x = -width * 2;
      spikey5.y = tileArray[121].y + tileSize;

      spikey6.x = tileArray[122].x + tileSize;
      spikey6.y = tileArray[122].y + tileSize;
      break;

    case eight:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = true;
      spikey4.show = true;
      spikey5.show = true;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[24].x + tileSize;
      spikey2.y = tileArray[24].y;

      spikey3.x = tileArray[74].x;
      spikey3.y = tileArray[74].y;

      spikey4.x = tileArray[70].y;
      spikey4.y = tileArray[70].y + tileSize;

      spikey5.x = tileArray[119].x;
      spikey5.y = tileArray[119].y + tileSize;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    case nine:
      spikey1.show = true;
      spikey2.show = true;
      spikey3.show = true;
      spikey4.show = false;
      spikey5.show = true;
      spikey6.show = true;

      spikey1.x = tileArray[20].x;
      spikey1.y = tileArray[20].y;

      spikey2.x = tileArray[24].x + tileSize;
      spikey2.y = tileArray[24].y;

      spikey3.x = tileArray[74].x;
      spikey3.y = tileArray[74].y + tileSize;

      spikey4.x = width * 2;
      spikey4.y = tileArray[74].y + tileSize;

      spikey5.x = tileArray[119].x;
      spikey5.y = tileArray[119].y + tileSize;

      spikey6.x = tileArray[123].x + tileSize;
      spikey6.y = tileArray[123].y + tileSize;
      break;

    default:
    //  spikey1.x = width / 2
    //  spikey1.y = height / 2
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
    noStroke();
    if (this.show) {
      noFill();
    } else {
      // Debug aid
      fill(0);

      //fill(200, 20, 20);
      //stroke(0);
    }
    rect(this.x, this.y, this.size * 1.02, this.size * 1.02);
    fill(0);
    textAlign(CENTER);
    // text(this.id, this.x + 50, this.y + 50)
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

    // generate the lines once
    // TODO: stop lines after touching filled squares
    for (let angle = 0; angle <= 360; angle += 1) {
      let length = random(this.size / 8, this.size);
      this.lines.push({ angle, length });
    }
  }

  // Move the Spikey to the new position
  updatePosition() {
    let distX = this.x - this.oldX;
    if (abs(distX) >= 0.01 * poster.vw) {
      distX *= 0.02 * poster.vw;
      this.oldX += distX;
    } else {
      this.oldX = this.x;
    }
    let distY = this.y - this.oldY;
    if (abs(distY) >= 0.01 * poster.vw) {
      distY *= 0.02 * poster.vw;
      this.oldY += distY;
    } else {
      this.oldY = this.y;
    }

    //  this.oldX = this.x;
    //  this.oldY = this.y;
  }

  display() {
    this.updatePosition();
    if (this.show) {
      noStroke();
      // mousePos = map(mouseX, 0, width, 0.005, 0.06)
      fill(255);
      stroke(255);

      // apply lines to Spikey
      for (let l of this.lines) {
        // Use a discrete tier selected by mousePos (0..1): left=thin, mid=med, right=thick
        let tier = 1; // default medium
        if (typeof mousePos === "number") {
          if (mousePos < 0.33) tier = 0;
          else if (mousePos < 0.66) tier = 1;
          else tier = 2;
        }

        let baseMin, baseMax;
        if (tier === 0) {
          baseMin = 0.5 * poster.vw;
          baseMax = 0.75 * poster.vw;
        } else if (tier === 1) {
          baseMin = 0.75 * poster.vw;
          baseMax = 1 * poster.vw;
        } else {
          baseMin = 1 * poster.vw;
          baseMax = 1.5 * poster.vw;
        }

        let oscillatingStroke = this.sinMovement(
          l.angle,
          frameCount * -0.02,
          baseMin,
          baseMax
        );
        strokeWeight(oscillatingStroke);
        push();
        translate(this.oldX, this.oldY);
        rotate(radians(l.angle));
        let oscillatingLength = 0;

        if (l.length > this.size * 0.8) {
          oscillatingLength = this.sinMovement(
            l.angle,
            frameCount * 0.01,
            0,
            this.size / 8 + (poster.position.x * poster.vw) / 10
          );
        } else {
          oscillatingLength = this.sinMovement(
            l.angle,
            frameCount * 0.01,
            0,
            this.size / 10 + (poster.position.x * poster.vw) / 10
          );
        }

        line(0, 0, oscillatingLength, 0);
        pop();
      }
    }
  }

  sinMovement(angle, offset, minVal, maxVal) {
    let factor = sin(angle + offset);
    let sinMovementVal = map(factor, -1, 1, minVal, maxVal);
    return sinMovementVal;
  }
}

function windowResized() { // this is a custom event called whenever the poster is scaled
  // textSize(10 * poster.vw);
  updateTiles();
  showTemplate(numbers[poster.getCounter()])
}

