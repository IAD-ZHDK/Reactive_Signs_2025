// Shared resource loader for Team2Instance
window.Team2Resources = window.Team2Resources || {
  loaded: false,
  font: null,
  microgramma: null,
  images: {},
  imageArray: [],
  preload: function (p) {
    // Fonts
    const BASE_PATH = window.basePath;
    this.font = p.loadFont(`${BASE_PATH}barlow_condensed.otf`);
    this.microgramma = p.loadFont(`${BASE_PATH}Microgramma_Normal.otf`);
    // Images (use absolute paths)
    const styles = [1875, 1891, 1907, 1926, 1945, 1964, 1983, 2000, 2010, 2025];
    for (let s = 0; s < styles.length; s++) {
      this.imageArray[s] = [];
      for (let d = 0; d < 10; d++) {
        const key = `${styles[s]}-${d}`;
        this.images[key] = p.loadImage(`${BASE_PATH}Images/${styles[s]}-${d}.png`);
        this.imageArray[s][d] = this.images[key];
      }
    }
  }
};


// p5.js instance mode
window.sketch = function (p) {
  const Resources = window.Team2Resources;
  let rotationHistory = [];
  let textStartXPos = 0;
  let textStartXPosTarget = 0;
  let textEndXPos;
  let textYPos;
  let currentPos = 0;
  let StyleSelector = ["  1875  ", "  1891  ", "  1907  ", "  1926  ", "  1945  ", "  1964  ", "  1983  ", "  2000  ", "  2010  ", "  2025  "];
  let chosenStyle = 5;
  let imgWidthB, imgHeightB, imgWidthS, imgHeightS;
  let imgXPos, imgYPos;
  let imgXPosCurrent = 0;
  let imgXPosTarget = 0;
  let pastNumber = 0;
  let movingFlag = false;

  p.preload = function () {
    if (!Resources.loaded) {
      Resources.preload(p);
      Resources.loaded = true;
    }
  }

  p.setup = function () {
    p.createCanvas(100, 100);
    p.textFont(Resources.microgramma);
    p.imageMode(p.CENTER);
    p.textAlign(p.CENTER);
    textStartXPos = 265 * p.poster.vw;
    imgXPosCurrent = 0 * p.poster.vw;
    imgXPosTarget = 0 * p.poster.vw;
  }

  p.draw = function () {
    p.background(255);
    p.strokeCap(p.ROUND);
    p.textAlign(p.CENTER);

    //color rect background
    p.push();
    p.fill(0);
    p.noStroke();
    p.rect(-10 * p.poster.vw, -24.2 * p.poster.vh, 200 * p.poster.vw, 120 * p.poster.vh);
    p.pop();

    p.push();
    p.translate(10 * p.poster.vw, 80 * p.poster.vh);
    p.fill(255);

    imgWidthB = 93 * p.poster.vw;
    imgHeightB = 93 * p.poster.vh;
    imgWidthS = 50 * p.poster.vw;
    imgHeightS = 50 * p.poster.vh;

    imgXPos = 0 * p.poster.vw;
    imgYPos = -30.6 * p.poster.vh;

    // Style selection logic
    let px = p.poster.position.x;
    if (px > 0 * p.poster.vw && px < 10 * p.poster.vw) {
      chosenStyle = 0;
    } else if (px > 10 * p.poster.vw && px < 20 * p.poster.vw) {
      chosenStyle = 1;
    } else if (px > 20 * p.poster.vw && px < 30 * p.poster.vw) {
      chosenStyle = 2;
    } else if (px > 30 * p.poster.vw && px < 40 * p.poster.vw) {
      chosenStyle = 3;
    } else if (px > 40 * p.poster.vw && px < 50 * p.poster.vw) {
      chosenStyle = 4;
    } else if (px > 50 * p.poster.vw && px < 60 * p.poster.vw) {
      chosenStyle = 5;
    } else if (px > 60 * p.poster.vw && px < 70 * p.poster.vw) {
      chosenStyle = 6;
    } else if (px > 70 * p.poster.vw && px < 80 * p.poster.vw) {
      chosenStyle = 7;
    } else if (px > 80 * p.poster.vw && px < 90 * p.poster.vw) {
      chosenStyle = 8;
    } else if (px > 90 * p.poster.vw && px < 100 * p.poster.vw) {
      chosenStyle = 9;
    }

    let direction = 0;
    let leftImage = p.poster.counter;
    let rightImage = p.poster.counter;
    let centerImage = pastNumber;

    // get direction
    if (pastNumber < p.poster.counter) {
      direction = -95 * p.poster.vw;
    } else {
      direction = 95 * p.poster.vw;
    }

    if (movingFlag == false && pastNumber != p.poster.counter) {
      imgXPosTarget += direction;
      movingFlag = true;
    }

    if (Math.abs(imgXPosTarget - imgXPosCurrent) > 1 && movingFlag == true) {
      let speed = 0.2;
      let imgdifference = (imgXPosTarget - imgXPosCurrent) * speed;
      imgXPosCurrent += imgdifference;
    } else {
      imgXPosCurrent = 40 * p.poster.vw;
      imgXPosTarget = imgXPosCurrent;
      movingFlag = false;
      pastNumber = p.poster.counter;
      centerImage = p.poster.counter;
    }

    // display the current number
    p.image(Resources.imageArray[chosenStyle][centerImage], imgXPosCurrent, imgYPos, imgWidthB, imgHeightB);
    p.image(Resources.imageArray[chosenStyle][leftImage], imgXPosCurrent - 95 * p.poster.vw, imgYPos, imgWidthB, imgHeightB);
    p.image(Resources.imageArray[chosenStyle][rightImage], imgXPosCurrent + 95 * p.poster.vw, imgYPos, imgWidthB, imgHeightB);

    // style slider
    textEndXPos = -190 * p.poster.vw;
    textYPos = 19.6 * p.poster.vh;
    p.textSize(5 * p.poster.vh);
    p.fill(0);

    if (px > 0 * p.poster.vw && px < 10 * p.poster.vw) {
      textStartXPosTarget = 266 * p.poster.vw;
    } else if (px > 10 * p.poster.vw && px < 20 * p.poster.vw) {
      textStartXPosTarget = 216.8 * p.poster.vw;
    } else if (px > 20 * p.poster.vw && px < 30 * p.poster.vw) {
      textStartXPosTarget = 166.3 * p.poster.vw;
    } else if (px > 30 * p.poster.vw && px < 40 * p.poster.vw) {
      textStartXPosTarget = 116 * p.poster.vw;
    } else if (px > 40 * p.poster.vw && px < 50 * p.poster.vw) {
      textStartXPosTarget = 65.5 * p.poster.vw;
    } else if (px > 50 * p.poster.vw && px < 60 * p.poster.vw) {
      textStartXPosTarget = 15 * p.poster.vw;
    } else if (px > 60 * p.poster.vw && px < 70 * p.poster.vw) {
      textStartXPosTarget = -35.6 * p.poster.vw;
    } else if (px > 70 * p.poster.vw && px < 80 * p.poster.vw) {
      textStartXPosTarget = -86.1 * p.poster.vw;
    } else if (px > 80 * p.poster.vw && px < 90 * p.poster.vw) {
      textStartXPosTarget = -136.6 * p.poster.vw;
    } else if (px > 90 * p.poster.vw && px < 100 * p.poster.vw) {
      textStartXPosTarget = -187 * p.poster.vw;
    }

    let difference = (textStartXPosTarget - textStartXPos) * 0.05;
    textStartXPos += difference;
    p.text(StyleSelector.join(""), textStartXPos, textYPos);
    p.pop();
  };

  p.windowResized = function () {
    p.textSize(10 * p.poster.vw);
    textStartXPos = 265 * p.poster.vw;
  };
};
