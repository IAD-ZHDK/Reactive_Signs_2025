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


function preload() {
  font = loadFont('Montserrat-Black.otf');
  font = loadFont('Montserrat-Black.ttf'); // fallback font
}

function setup() {


  /*important!*/ createCanvas(100,100); // Don't remove this line. 
  textFont(font);
  rectMode(CORNER)

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
    ]
numbers.push(zero)
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
  ]
numbers.push(one)

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
]
numbers.push(two)

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
]
numbers.push(three)

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
]
numbers.push(four)

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
]
numbers.push(five)

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
]
numbers.push(six)

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
]
numbers.push(seven)

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
]
numbers.push(eight)

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
]
numbers.push(nine)

  showTemplate(numbers[0]);
}



function updateTiles() {
  tileArray = [];
  tileSize = poster.vw *100/9
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let showTile = true;

      let tile = new Tile(col * tileSize, row * tileSize, tileSize, showTile, row * cols + col);
      tileArray.push(tile);
    }
  }
}




function draw() {

  if (poster.position.x > width / 2) {
    background(0);

} else {
    background(255);
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
    showTemplate(numbers[poster.getCounter()])
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
    tileArray[i].show = template[i]
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

    spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
    break;

case one:

    spikey1.show = false;
    spikey2.show = true;
    spikey3.show = false;
    spikey4.show = true;
    spikey5.show = false;
    spikey6.show = true;

    spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
    break;

case two:

    spikey1.show = true;
    spikey2.show = true;
    spikey3.show = true;
    spikey4.show = true;
    spikey5.show = true;
    spikey6.show = true;

    spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
    break;

case three:

    spikey1.show = true;
    spikey2.show = true;
    spikey3.show = true;
    spikey4.show = true;
    spikey5.show = true;
    spikey6.show = true;

    spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
    break;

case four:
   
spikey1.show = true;
spikey2.show = true;
spikey3.show = true;
spikey4.show = true;
spikey5.show = false;
spikey6.show = true;

spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
break;

case five:

    spikey1.show = true;
    spikey2.show = true;
    spikey3.show = true;
    spikey4.show = true;
    spikey5.show = true;
    spikey6.show = true;

    spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
    break;

case six:
    
    spikey1.show = true;
    spikey2.show = true;
    spikey3.show = true;
    spikey4.show = true;
    spikey5.show = true;
    spikey6.show = true;

    spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
    break;

case seven:
    
spikey1.show = true;
spikey2.show = true;
spikey3.show = true;
spikey4.show = true;
spikey5.show = false;
spikey6.show = true;

spikey1.x = tileArray[10].x + tileSize/2
spikey1.y = tileArray[10].y + tileSize/2

spikey2.x = tileArray[16].x + tileSize/2
spikey2.y = tileArray[16].y + tileSize/2

spikey3.x = tileArray[63].x + tileSize/2
spikey3.y = tileArray[63].y + tileSize/2

spikey4.x = tileArray[71].x + tileSize/2
spikey4.y = tileArray[71].y + tileSize/2

spikey5.x = tileArray[127].x + tileSize/2
spikey5.y = tileArray[127].y + tileSize/2

spikey6.x = tileArray[133].x + tileSize/2
spikey6.y = tileArray[133].y + tileSize/2
break;

case eight:

    spikey1.show = true;
    spikey2.show = true;
    spikey3.show = true;
    spikey4.show = true;
    spikey5.show = true;
    spikey6.show = true;

    spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
    break;

    case nine:

    spikey1.show = true;
    spikey2.show = true;
    spikey3.show = true;
    spikey4.show = true;
    spikey5.show = true;
    spikey6.show = true;

    spikey1.x = tileArray[10].x + tileSize/2
    spikey1.y = tileArray[10].y + tileSize/2

    spikey2.x = tileArray[16].x + tileSize/2
    spikey2.y = tileArray[16].y + tileSize/2

    spikey3.x = tileArray[63].x + tileSize/2
    spikey3.y = tileArray[63].y + tileSize/2

    spikey4.x = tileArray[71].x + tileSize/2
    spikey4.y = tileArray[71].y + tileSize/2

    spikey5.x = tileArray[127].x + tileSize/2
    spikey5.y = tileArray[127].y + tileSize/2

    spikey6.x = tileArray[133].x + tileSize/2
    spikey6.y = tileArray[133].y + tileSize/2
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
    this.id = id + 1
  }
  display() {
    noStroke()
    if (this.show) {
      noFill();

    } else {
      // Debug aid
      if (poster.position.x > width / 2) {
        fill(0)
      } else {
        fill(255)
      }
      //fill(200, 20, 20);
      //stroke(0); 
    }
    rect(this.x, this.y, this.size*1.02, this.size*1.02);
    fill(0)
    textAlign(CENTER)
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
      let length = random(this.size/12, this.size);
      this.lines.push({ angle, length });
    }
  }

  // Move the Spikey to the new position  
  updatePosition() {
    let distX = (this.x - this.oldX)
    if (abs(distX) >= 0.01 * poster.vw) {
      distX *= 0.02 * poster.vw;
      this.oldX += distX;
    } else {
      this.oldX = this.x;
    }
    let distY = (this.y - this.oldY)
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
    this.updatePosition()
    if (this.show) {
      noStroke()
      // mousePos = map(mouseX, 0, width, 0.005, 0.06)
      if (poster.position.x > width / 2) {
          fill(255);
          stroke(255);
      } else {
          fill(0);
          stroke(0);
      }


      // apply lines to Spikey
      for (let l of this.lines) {
        let oscillatingStroke = this.sinMovement(l.angle, frameCount * -0.02, 0.05 * poster.vw, 0.2 * poster.vw);
        strokeWeight(oscillatingStroke);
        push();
        translate(this.oldX, this.oldY);
        rotate(radians(l.angle));
        let oscillatingLength = 0

        if (l.length > this.size * 0.7) {
          oscillatingLength = this.sinMovement(l.angle, frameCount * 0.01, 0, this.size/8 + (poster.position.x*poster.vw/10));
        } else {
          oscillatingLength = this.sinMovement(l.angle, frameCount * 0.01, 0, this.size/10 + (poster.position.x*poster.vw/10));
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

function windowScaled() { // this is a custom event called whenever the poster is scaled
  // textSize(10 * poster.vw);
  updateTiles();
  showTemplate(numbers[poster.getCounter()])
}





