//11.12.2024 image easing function

let rotationHistory = [];

//style/year selector
let textStartXPos = 0;
let textStartXPosTarget = 0;
let textEndXPos;
let textYPos;
let currentPos = 0;
StyleSelector = ["  1875  ", "  1891  ", "  1907  ", "  1926  ", "  1945  ", "  1964  ", "  1983  ", "  2000  ", "  2010  ", "  2025  "];

//image style changer
let chosenStyle = 5;

//image size/values
let imgWidthB;
let imgHeightB;
let imgWidthS;
let imgHeightS;

let imgXPos;
let imgYPos;

//image movement
let imgXPosCurrent = 0;
let imgXPosTarget = 0;


//defining all Images
let S1879Nr0, S1879Nr1, S1879Nr2, S1879Nr3, S1879Nr4, S1879Nr5, S1879Nr6, S1879Nr7, S1879Nr8, S1879Nr9;
let S1891Nr0, S1891Nr1, S1891Nr2, S1891Nr3, S1891Nr4, S1891Nr5, S1891Nr6, S1891Nr7, S1891Nr8, S1891Nr9;
let S1907Nr0, S1907Nr1, S1907Nr2, S1907Nr3, S1907Nr4, S1907Nr5, S1907Nr6, S1907Nr7, S1907Nr8, S1907Nr9;
let S1926Nr0, S1926Nr1, S1926Nr2, S1926Nr3, S1926Nr4, S1926Nr5, S1926Nr6, S1926Nr7, S1926Nr8, S1926Nr9;
let S1945Nr0, S1945Nr1, S1945Nr2, S1945Nr3, S1945Nr4, S1945Nr5, S1945Nr6, S1945Nr7, S1945Nr8, S1945Nr9;
let S1964Nr0, S1964Nr1, S1964Nr2, S1964Nr3, S1964Nr4, S1964Nr5, S1964Nr6, S1964Nr7, S1964Nr8, S1964Nr9;
let S1983Nr0, S1983Nr1, S1983Nr2, S1983Nr3, S1983Nr4, S1983Nr5, S1983Nr6, S1983Nr7, S1983Nr8, S1983Nr9;
let S2000Nr0, S2000Nr1, S2000Nr2, S2000Nr3, S2000Nr4, S2000Nr5, S2000Nr6, S2000Nr7, S2000Nr8, S2000Nr9;
let S2010Nr0, S2010Nr1, S2010Nr2, S2010Nr3, S2010Nr4, S2010Nr5, S2010Nr6, S2010Nr7, S2010Nr8, S2010Nr9;
let S2025Nr0, S2025Nr1, S2025Nr2, S2025Nr3, S2025Nr4, S2025Nr5, S2025Nr6, S2025Nr7, S2025Nr8, S2025Nr9;


let ImageArray;

let Microgramma;

//animation variables
let pastNumber = 0;
let movingFlag = false;

function preload() {
  // load the font
  font = loadFont('barlow_condensed.otf');
  Microgramma = loadFont('Microgramma_Normal.otf');

  //1879 Style 1 Digits 0-9
  S1879Nr0 = loadImage("Images/1875-0.png");
  S1879Nr1 = loadImage("Images/1875-1.png");
  S1879Nr2 = loadImage("Images/1875-2.png");
  S1879Nr3 = loadImage("Images/1875-3.png");
  S1879Nr4 = loadImage("Images/1875-4.png");
  S1879Nr5 = loadImage("Images/1875-5.png");
  S1879Nr6 = loadImage("Images/1875-6.png");
  S1879Nr7 = loadImage("Images/1875-7.png");
  S1879Nr8 = loadImage("Images/1875-8.png");
  S1879Nr9 = loadImage("Images/1875-9.png");
  //1891 Style 1 Digit
  S1891Nr0 = loadImage("Images/1891-0.png");
  S1891Nr1 = loadImage("Images/1891-1.png");
  S1891Nr2 = loadImage("Images/1891-2.png");
  S1891Nr3 = loadImage("Images/1891-3.png");
  S1891Nr4 = loadImage("Images/1891-4.png");
  S1891Nr5 = loadImage("Images/1891-5.png");
  S1891Nr6 = loadImage("Images/1891-6.png");
  S1891Nr7 = loadImage("Images/1891-7.png");
  S1891Nr8 = loadImage("Images/1891-8.png");
  S1891Nr9 = loadImage("Images/1891-9.png");
  //1907 Style 1 Digit
  S1907Nr0 = loadImage("Images/1907-0.png");
  S1907Nr1 = loadImage("Images/1907-1.png");
  S1907Nr2 = loadImage("Images/1907-2.png");
  S1907Nr3 = loadImage("Images/1907-3.png");
  S1907Nr4 = loadImage("Images/1907-4.png");
  S1907Nr5 = loadImage("Images/1907-5.png");
  S1907Nr6 = loadImage("Images/1907-6.png");
  S1907Nr7 = loadImage("Images/1907-7.png");
  S1907Nr8 = loadImage("Images/1907-8.png");
  S1907Nr9 = loadImage("Images/1907-9.png");
  //1926 Style 1 Digit
  S1926Nr0 = loadImage("Images/1926-0.png");
  S1926Nr1 = loadImage("Images/1926-1.png");
  S1926Nr2 = loadImage("Images/1926-2.png");
  S1926Nr3 = loadImage("Images/1926-3.png");
  S1926Nr4 = loadImage("Images/1926-4.png");
  S1926Nr5 = loadImage("Images/1926-5.png");
  S1926Nr6 = loadImage("Images/1926-6.png");
  S1926Nr7 = loadImage("Images/1926-7.png");
  S1926Nr8 = loadImage("Images/1926-8.png");
  S1926Nr9 = loadImage("Images/1926-9.png");
  //1945 Style 1 Digit
  S1945Nr0 = loadImage("Images/1945-0.png");
  S1945Nr1 = loadImage("Images/1945-1.png");
  S1945Nr2 = loadImage("Images/1945-2.png");
  S1945Nr3 = loadImage("Images/1945-3.png");
  S1945Nr4 = loadImage("Images/1945-4.png");
  S1945Nr5 = loadImage("Images/1945-5.png");
  S1945Nr6 = loadImage("Images/1945-6.png");
  S1945Nr7 = loadImage("Images/1945-7.png");
  S1945Nr8 = loadImage("Images/1945-8.png");
  S1945Nr9 = loadImage("Images/1945-9.png");
  //1964 Style 1 Digit
  S1964Nr0 = loadImage("Images/1964-0.png");
  S1964Nr1 = loadImage("Images/1964-1.png");
  S1964Nr2 = loadImage("Images/1964-2.png");
  S1964Nr3 = loadImage("Images/1964-3.png");
  S1964Nr4 = loadImage("Images/1964-4.png");
  S1964Nr5 = loadImage("Images/1964-5.png");
  S1964Nr6 = loadImage("Images/1964-6.png");
  S1964Nr7 = loadImage("Images/1964-7.png");
  S1964Nr8 = loadImage("Images/1964-8.png");
  S1964Nr9 = loadImage("Images/1964-9.png");
  //1983 Style 1 Digit
  S1983Nr0 = loadImage("Images/1983-0.png");
  S1983Nr1 = loadImage("Images/1983-1.png");
  S1983Nr2 = loadImage("Images/1983-2.png");
  S1983Nr3 = loadImage("Images/1983-3.png");
  S1983Nr4 = loadImage("Images/1983-4.png");
  S1983Nr5 = loadImage("Images/1983-5.png");
  S1983Nr6 = loadImage("Images/1983-6.png");
  S1983Nr7 = loadImage("Images/1983-7.png");
  S1983Nr8 = loadImage("Images/1983-8.png");
  S1983Nr9 = loadImage("Images/1983-9.png");
  //2000 Style 1 Digit
  S2000Nr0 = loadImage("Images/2000-0.png");
  S2000Nr1 = loadImage("Images/2000-1.png");
  S2000Nr2 = loadImage("Images/2000-2.png");
  S2000Nr3 = loadImage("Images/2000-3.png");
  S2000Nr4 = loadImage("Images/2000-4.png");
  S2000Nr5 = loadImage("Images/2000-5.png");
  S2000Nr6 = loadImage("Images/2000-6.png");
  S2000Nr7 = loadImage("Images/2000-7.png");
  S2000Nr8 = loadImage("Images/2000-8.png");
  S2000Nr9 = loadImage("Images/2000-9.png");
  //2010 Style 1 Digit
  S2010Nr0 = loadImage("Images/2010-0.png");
  S2010Nr1 = loadImage("Images/2010-1.png");
  S2010Nr2 = loadImage("Images/2010-2.png");
  S2010Nr3 = loadImage("Images/2010-3.png");
  S2010Nr4 = loadImage("Images/2010-4.png");
  S2010Nr5 = loadImage("Images/2010-5.png");
  S2010Nr6 = loadImage("Images/2010-6.png");
  S2010Nr7 = loadImage("Images/2010-7.png");
  S2010Nr8 = loadImage("Images/2010-8.png");
  S2010Nr9 = loadImage("Images/2010-9.png");
  //2025 Style 1 Digit
  S2025Nr0 = loadImage("Images/2025-0.png");
  S2025Nr1 = loadImage("Images/2025-1.png");
  S2025Nr2 = loadImage("Images/2025-2.png");
  S2025Nr3 = loadImage("Images/2025-3.png");
  S2025Nr4 = loadImage("Images/2025-4.png");
  S2025Nr5 = loadImage("Images/2025-5.png");
  S2025Nr6 = loadImage("Images/2025-6.png");
  S2025Nr7 = loadImage("Images/2025-7.png");
  S2025Nr8 = loadImage("Images/2025-8.png");
  S2025Nr9 = loadImage("Images/2025-9.png");

  // Update ImageArray after images are loade
  ImageArray = [
    //1879  [0]
    [S1879Nr0, S1879Nr1, S1879Nr2, S1879Nr3, S1879Nr4, S1879Nr5, S1879Nr6, S1879Nr7, S1879Nr8, S1879Nr9],
    //1891 [1]
    [S1891Nr0, S1891Nr1, S1891Nr2, S1891Nr3, S1891Nr4, S1891Nr5, S1891Nr6, S1891Nr7, S1891Nr8, S1891Nr9],
    //1907 [2]
    [S1907Nr0, S1907Nr1, S1907Nr2, S1907Nr3, S1907Nr4, S1907Nr5, S1907Nr6, S1907Nr7, S1907Nr8, S1907Nr9],
    //1926 [3]
    [S1926Nr0, S1926Nr1, S1926Nr2, S1926Nr3, S1926Nr4, S1926Nr5, S1926Nr6, S1926Nr7, S1926Nr8, S1926Nr9],
    //1945 [4]
    [S1945Nr0, S1945Nr1, S1945Nr2, S1945Nr3, S1945Nr4, S1945Nr5, S1945Nr6, S1945Nr7, S1945Nr8, S1945Nr9],
    //1964 [5]
    [S1964Nr0, S1964Nr1, S1964Nr2, S1964Nr3, S1964Nr4, S1964Nr5, S1964Nr6, S1964Nr7, S1964Nr8, S1964Nr9],
    //1983 [6]
    [S1983Nr0, S1983Nr1, S1983Nr2, S1983Nr3, S1983Nr4, S1983Nr5, S1983Nr6, S1983Nr7, S1983Nr8, S1983Nr9],
    //2000 [7]
    [S2000Nr0, S2000Nr1, S2000Nr2, S2000Nr3, S2000Nr4, S2000Nr5, S2000Nr6, S2000Nr7, S2000Nr8, S2000Nr9],
    //2010 [8]
    [S2010Nr0, S2010Nr1, S2010Nr2, S2010Nr3, S2010Nr4, S2010Nr5, S2010Nr6, S2010Nr7, S2010Nr8, S2010Nr9],
    //2025 [9]
    [S2025Nr0, S2025Nr1, S2025Nr2, S2025Nr3, S2025Nr4, S2025Nr5, S2025Nr6, S2025Nr7, S2025Nr8, S2025Nr9]
  ];
}

function setup() {
  /*important!*/ createCanvas(100,100); // Don't remove this line. 
  textFont(Microgramma);
  imageMode(CENTER)
  textAlign(CENTER)
  //textmovement
  textStartXPos = 265 * poster.vw;

  //imagemovemet
  imgXPosCurrent = 0 * poster.vw
  imgXPosTarget = 0 * poster.vw
}

function draw() {
  background(255)
  strokeCap(ROUND);
  textAlign(CENTER)

  //color rect background
  push()
  fill(0)
  noStroke()
  rect(-10 * poster.vw, -24.2 * poster.vh, 200 * poster.vw, 120 * poster.vh)
  pop()

  push()
  translate(10 * poster.vw, 80 * poster.vh)
  fill(255)



  imgWidthB = 93 * poster.vw
  imgHeightB = 93 * poster.vh
  imgWidthS = 50 * poster.vw
  imgHeightS = 50 * poster.vh

  imgXPos = 0 * poster.vw
  imgYPos = -30.6 * poster.vh



  if (poster.position.x > 0 * poster.vw && poster.position.x < 10 * poster.vw) {
    chosenStyle = 0
  } else if (poster.position.x > 10 * poster.vw && poster.position.x < 20 * poster.vw) {
    chosenStyle = 1
  } else if (poster.position.x > 20 * poster.vw && poster.position.x < 30 * poster.vw) {
    chosenStyle = 2
  } else if (poster.position.x > 30 * poster.vw && poster.position.x < 40 * poster.vw) {
    chosenStyle = 3
  } else if (poster.position.x > 40 * poster.vw && poster.position.x < 50 * poster.vw) {
    chosenStyle = 4
  } else if (poster.position.x > 50 * poster.vw && poster.position.x < 60 * poster.vw) {
    chosenStyle = 5
  } else if (poster.position.x > 60 * poster.vw && poster.position.x < 70 * poster.vw) {
    chosenStyle = 6
  } else if (poster.position.x > 70 * poster.vw && poster.position.x < 80 * poster.vw) {
    chosenStyle = 7
  } else if (poster.position.x > 80 * poster.vw && poster.position.x < 90 * poster.vw) {
    chosenStyle = 8
  } else if (poster.position.x > 90 * poster.vw && poster.position.x < 100 * poster.vw) {
    chosenStyle = 9
  }



  let direction = 0;
  let leftImage = poster.getCounter();
  let rightImage = poster.getCounter();
  let centerImage = pastNumber;

  // get direction
  if (pastNumber < poster.getCounter()) { // this condition could be fixed to wrap corectly from 9 to 0 and 0 to 9
    // counting up (going left)
    direction = -95 * poster.vw
    console.log("counting up,left")
  } else {
    // counting down (going right)
    direction = 95 * poster.vw
    console.log("counting down,right")
  }

  if (movingFlag == false && pastNumber != poster.getCounter()) {
    // if the number has changed and we are not moving yet then update the diretion and triger the moving flag 
    imgXPosTarget += direction;
    movingFlag = true;
  }

  if (abs(imgXPosTarget - imgXPosCurrent) > 1 && movingFlag == true) { // if we are greater than 1 pixels away from the target, then move
    //update the imgXPosCurrent and move towards center
    let speed = 0.2; // the speed of the movement
    let imgdifference = (imgXPosTarget - imgXPosCurrent) * speed;
    imgXPosCurrent += imgdifference;
  } else {  // movement is finished
    imgXPosCurrent = 40 * poster.vw; // the standard position
    imgXPosTarget = imgXPosCurrent
    movingFlag = false;
    pastNumber = poster.getCounter();
    centerImage = poster.getCounter();
  }


  //covering rectangles on top and left/right
  fill(0)
  noStroke()
  //fixed rectangle left and right
  //rect(88 * poster.vw, -79 * poster.vh, 10 * poster.vw, 94.9 * poster.vh)
  //rect(-18 * poster.vw, -79 * poster.vh, 10 * poster.vw, 94.9 * poster.vh)

  //moving rectangle middle
  //rect(imgXPosCurrent - 141.5 * poster.vw, -79 * poster.vh, 93 * poster.vw, 94.9 * poster.vh)
  //rect(imgXPosCurrent - 46.5 * poster.vw, -79 * poster.vh, 93 * poster.vw, 94.9 * poster.vh)


  //displaying the current number
  image(ImageArray[chosenStyle][centerImage], imgXPosCurrent, imgYPos, imgWidthB, imgHeightB)
  image(ImageArray[chosenStyle][leftImage], imgXPosCurrent - 95 * poster.vw, imgYPos, imgWidthB, imgHeightB) // left image
  image(ImageArray[chosenStyle][rightImage], imgXPosCurrent + 95 * poster.vw, imgYPos, imgWidthB, imgHeightB) // right image


  //defining style slider
  //style slider movement

  textEndXPos = -190 * poster.vw
  textYPos = 19.6 * poster.vh
  textSize(5 * poster.vh)
  fill(0)

  if (poster.position.x > 0 * poster.vw && poster.position.x < 10 * poster.vw) {
    textStartXPosTarget = 266 * poster.vw
  } else if (poster.position.x > 10 * poster.vw && poster.position.x < 20 * poster.vw) {
    textStartXPosTarget = 216.8 * poster.vw
  } else if (poster.position.x > 20 * poster.vw && poster.position.x < 30 * poster.vw) {
    textStartXPosTarget = 166.3 * poster.vw
  } else if (poster.position.x > 30 * poster.vw && poster.position.x < 40 * poster.vw) {
    textStartXPosTarget = 116 * poster.vw
  } else if (poster.position.x > 40 * poster.vw && poster.position.x < 50 * poster.vw) {
    textStartXPosTarget = 65.5 * poster.vw
  } else if (poster.position.x > 50 * poster.vw && poster.position.x < 60 * poster.vw) {
    textStartXPosTarget = 15 * poster.vw
  } else if (poster.position.x > 60 * poster.vw && poster.position.x < 70 * poster.vw) {
    textStartXPosTarget = -35.6 * poster.vw
  } else if (poster.position.x > 70 * poster.vw && poster.position.x < 80 * poster.vw) {
    textStartXPosTarget = -86.1 * poster.vw
  } else if (poster.position.x > 80 * poster.vw && poster.position.x < 90 * poster.vw) {
    textStartXPosTarget = -136.6 * poster.vw
  } else if (poster.position.x > 90 * poster.vw && poster.position.x < 100 * poster.vw) {
    textStartXPosTarget = -187 * poster.vw
  }

  let difference = (textStartXPosTarget - textStartXPos) * 0.05;
  textStartXPos += difference;
  //console.log("difference" + difference)
  //console.log("textStartXPos_" + textStartXPos)
  //console.log("textStartXPosTarget_" + textStartXPosTarget)
  text(StyleSelector.join(""), textStartXPos, textYPos)
  pop()
}

function windowResized() { // this is a custom event called whenever the poster is scaled
  textSize(10 * poster.vw);
  textStartXPos = 265 * poster.vw;
}