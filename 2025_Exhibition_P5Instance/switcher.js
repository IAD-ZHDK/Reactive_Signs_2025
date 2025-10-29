let noFrames = 3;
let p5Instances = [];
let currentSketchFunction = null;
let loadedScripts = new Set(); // Track loaded script files

let posters = ['Team1', 'Team2', 'Team3', 'Team4', 'Team5', 'Team6', 'Team7']
let defaultPoster = 'PosterDefault';
let currentPoster = 4;
let intervalPosterChange = 240000; //4 minutes 
let intervalCountDown = 1000;
let trackingActive = false;
let streaming = false;
let demoMode = false
let incrementCounterInterval;
let frames = []
let myInterval;
let countInterval;
let count = 0;

window.onload = function () {
  adjustContainerSize();
  window.addEventListener('resize', function () {
    console.log("Window resized");
    adjustContainerSize();
  });

  // Load the first poster
  changePoster(currentPoster);

  countInterval = setInterval(countHandler, intervalCountDown);
  myInterval = setInterval(intervalHandler, intervalPosterChange);
  handleKeyEvents();
}

// Function to dynamically load a sketch file
function loadSketch(teamName) {
  return new Promise((resolve, reject) => {
    // Remove old script if it exists
    const oldScript = document.querySelector(`script[data-team="${teamName}"]`);
    if (oldScript) {
      oldScript.remove();
    }

    // Delete any existing sketch function
    if (window.sketch) {
      delete window.sketch;
    }

    // Create and load new script
    window.basePath = `Student_Posters/${teamName}/`;
    const script = document.createElement('script');
    script.src = `Student_Posters/${teamName}/sketch.js`;
    script.setAttribute('data-team', teamName);


    script.onload = () => {
      // Check if the sketch function exists
      if (typeof sketch === 'function') {
        currentSketchFunction = sketch;
        resolve(sketch);
      } else {
        reject(new Error(`Sketch function not found in ${teamName}/sketch.js`));
      }
    };

    script.onerror = () => {
      reject(new Error(`Failed to load ${teamName}/sketch.js`));
    };

    document.head.appendChild(script);
  });
}

// Function to clean up resources
function cleanupResources() {
  // Remove existing p5 instances
  for (let i = 0; i < p5Instances.length; i++) {
    if (p5Instances[i]) {
      p5Instances[i].remove();
    }
  }
  p5Instances = [];

  // Clear canvas divs
  for (let i = 0; i < noFrames; i++) {
    let posterDiv = document.getElementById('poster' + i);
    posterDiv.innerHTML = '';
  }

  // Force garbage collection hint
  if (window.gc) {
    window.gc();
  }
}

// Function to create p5 instances with the current sketch
// Function to create p5 instances with the current sketch
function createInstances() {
  if (!currentSketchFunction) {
    console.error("No sketch function loaded");
    return;
  }

  for (let i = 0; i < noFrames; i++) {
    const posterIndex = i;
    const poster = {
      getCounter: () => posterIndex,
      position: { x: 0, y: 0 },
      vw: 1,
      vh: 1
    };

    const sketchWithPoster = function (p) {
      p.poster = poster;
      currentSketchFunction(p);
    };

    const containerId = 'poster' + posterIndex;
    const canvasId = 'defaultCanvas' + posterIndex;
    console.log('Creating p5 instance in container:', containerId);

    const instance = new p5(sketchWithPoster, containerId);

    // Set canvas ID after creation
    if (instance.canvas) {
      instance.canvas.id = canvasId;
    }
    p5Instances[i] = instance;
  }
}
function changePoster(posterNo) {
  if (posterNo >= 0 && posterNo < posters.length && posterNo != null) {
    console.log("changing posters:" + posterNo);
    currentPoster = posterNo;

    const teamName = posters[posterNo];

    // Clean up existing resources
    cleanupResources();

    // Load new sketch dynamically
    loadSketch(teamName)
      .then(() => {
        console.log(`Successfully loaded ${teamName} sketch`);
        createInstances();
      })
      .catch((error) => {
        console.error(`Failed to load ${teamName} sketch:`, error);
        // Fallback to Team1 if available
        if (teamName !== 'Team1') {
          console.log("Falling back to Team1");
          changePoster(0);
        }
      });

  } else {
    console.log("changing posters to default");
    changePoster(0); // Use first poster as default
  }
}

// Rest of your existing functions remain the same...
function adjustContainerSize() {
  const container = document.querySelector('.container');
  const aspectRatio = 3240 / 1920;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const windowAspectRatio = windowWidth / windowHeight;

  if (windowAspectRatio > aspectRatio) {
    container.style.width = `${windowHeight * aspectRatio}px`;
    container.style.height = `${windowHeight}px`;
  } else {
    container.style.width = `${windowWidth}px`;
    container.style.height = `${windowWidth / aspectRatio}px`;
  }
}

function pickPoster(number) {
  if (number < posters.length && number >= 0) {
    console.log("poster no: " + number)
    transition(number)
  }
}

function transition(posterNo) {
  console.log("try transition animation");
  try {
    for (var i = 0; i < noFrames; i++) {
      let posterDiv = document.getElementById('poster' + i);
      fadeOut(posterDiv, posterNo);
    }
  } catch (e) {
    console.log("transition failed " + e);
  }
}

function intervalHandler() {
  clearInterval(myInterval);
  myInterval = setInterval(intervalHandler, intervalPosterChange)

  if (currentPoster < posters.length - 1) {
    currentPoster++;
  } else {
    currentPoster = 0;
  }
  pickPoster(currentPoster)
}

function countHandler() {
  count++;
  if (count > 150) {
    count = 150;
  }
  clearInterval(countInterval);
  countInterval = setInterval(countHandler, intervalCountDown)

  let countString = count.toString().padStart(3, '0');

  for (var i = 0; i < noFrames; i++) {
    let posterDiv = document.getElementById('poster' + i);
    let canvasElement = posterDiv.querySelector('canvas');
    let number = countString.charAt(i);

    try {
      if (canvasElement) {
        canvasElement.setAttribute('number', number);
      }
    } catch (e) {
      console.log("error setting canvas attribute: " + e);
    }
  }
}

function fadeOut(el, nextPosterNo) {
  let duration = 1000;
  var step = 10 / duration,
    opacity = 1;
  el.style.opacity = opacity;
  function next() {
    if (opacity <= 0) {
      changePoster(nextPosterNo);
      fadeIn(el)
      return;
    }
    el.style.opacity = (opacity -= step);
    setTimeout(next, 10);
  }
  next();
}

function fadeIn(el) {
  let duration = 1000;
  var step = 10 / duration,
    opacity = 0;
  el.style.opacity = opacity;
  function next() {
    if (opacity >= 1) {
      return;
    }
    el.style.opacity = (opacity += step);
    setTimeout(next, 10);
  }
  next();
}

function handleKeyEvents() {
  window.addEventListener('mousedown', function (event) {
    if (event.button === 0) {
      console.log('Click detected in parent window');
      document.documentElement.requestFullscreen();
    }
  });

  window.addEventListener('keydown', function (event) {
    let posterNumber = 0;
    let keyCode = event.code;
    console.log(keyCode)

    if (keyCode == "next") {
      if (currentPoster < posters.length - 1) {
        currentPoster++;
      } else {
        currentPoster = 0;
      }
      posterNumber = currentPoster;
      changePoster(posterNumber)
    } else {
      switch (keyCode) {
        case 'Digit1':
          posterNumber = 0;
          changePoster(posterNumber)
          break;
        case 'Digit2':
          posterNumber = 1;
          changePoster(posterNumber)
          break;
        case 'Digit3':
          posterNumber = 2;
          changePoster(posterNumber)
          break;
        case 'Digit4':
          posterNumber = 3;
          changePoster(posterNumber)
          break;
        case 'Digit5':
          posterNumber = 4;
          changePoster(posterNumber)
          break;
        case 'Digit6':
          posterNumber = 5;
          changePoster(posterNumber)
          break;
        case 'Digit7':
          posterNumber = 6;
          changePoster(posterNumber)
          break;
        case 'Digit8':
          posterNumber = 7;
          changePoster(posterNumber)
          break;
        default:
          posterNumber = null;
      }
    }
  });
}

class TesoTriangle {

  constructor(i, j, w, h) {

    this.i = i; //row and column
    this.j = j;

    this.w = width / gridCountX; // width and height -> dependant on canvas size
    this.h = height / gridCountY;

    this.x = i * this.w; // top left corver coordinates of triangle
    this.y = j * this.h;

    this.active = false; // boolean to determine color
    this.scale = 0; // Add scale property

    this.phaseOffset = (i + j) * 0.1;
    this.targetScale = 0; // Add target scale property
    this.animationSpeed = 0.1;
    this.isBlack = false;

    this.showLines = random() > 0.7;
  }

  updatePositions() {

    this.w = width / gridCountX; // width and height -> dependant on canvas size
    this.h = height / gridCountY;

    this.x = this.i * this.w; // top left corver coordinates of triangle
    this.y = this.j * this.h;

  }

  getRandomElements(arr, num) {
    var randomElements = [];
    let copyArr = [...arr]; // Create a copy of the array to avoid modifying the original array

    for (let i = 0; i < num; i++) {
      // Get a random index
      let randomIndex = Math.floor(Math.random() * copyArr.length);

      // Push the random element (subarray) into the result array
      randomElements.push(copyArr[randomIndex]);

      // Remove the selected element from the copyArr to avoid duplicates
      copyArr.splice(randomIndex, 1);
    }
    return randomElements;
  }
  // NEW CODE END


  showTriangle() {

    push(); // for every triangle new settingBase

    translate(this.x, this.y)


    //calling the number arrays to color them
    let currentDigits;
    switch (poster.getCounter()) {
      case 9: currentDigits = numberNine; break;
      case 8: currentDigits = numberEight; break;
      case 7: currentDigits = numberSeven; break;
      case 6: currentDigits = numberSix; break;
      case 5: currentDigits = numberFive; break;
      case 4: currentDigits = numberFour; break;
      case 3: currentDigits = numberThree; break;
      case 2: currentDigits = numberTwo; break;
      case 1: currentDigits = numberOne; break;
      case 0: currentDigits = numberZero; break;
    }

    let shouldBeBlack = currentDigits.some(item => item[0] === this.i && item[1] === this.j);


    // Update target scale based on whether triangle should be black
    if (shouldBeBlack) {
      this.targetScale = 1;
      this.isBlack = true;
    } else if (this.isBlack) {
      // If it was black but shouldn't be anymore, animate to disappear
      this.targetScale = 0;
      if (this.scale <= 0.01) {
        this.isBlack = false;
      }
    }

    let time = frameCount * 0.05; // Increased from 0.05 to 0.15 for faster wave
    let wave = sin(time + this.phaseOffset) * 0.1 + 1; // Keeps the subtle wave amplitude


    // Apply wave effect only during transitions
    let targetWithWave = this.targetScale;
    if (this.targetScale > 0) { // when triangle is part of the visible number
      targetWithWave = this.targetScale * wave;
    } else { // when disappearing
      targetWithWave = this.targetScale;
    }

    // Single animation update with different speeds for appear/disappear
    this.scale = lerp(this.scale, targetWithWave, this.targetScale === 0 ? 0.3 : 0.1);

    // Single scaling transformation
    translate(this.w / 2, this.h / 2);
    scale(this.scale);
    translate(-this.w / 2, -this.h / 2);
    // Set fill color
    if (this.isBlack) {
      fill(0);
    } else {
      fill(255);
    }

    let invert = this.i % 2;
    invert -= this.j % 2;

    let slider = map(poster.posNormal.x, 0, 1, -20, 20);

    if (invert) {
      let p1 = createVector(0, this.h / 2);
      let p2 = createVector(this.w, 0 - (this.h / 2));
      let p3 = createVector(this.w, this.h + (this.h / 2));

      let m = (p2.y - p1.y) / (p2.x - p1.x);
      let parallelStart = createVector(p1.x + slider, p1.y + slider);
      let deltaX = this.w + 100;
      let deltaY = m * deltaX;
      let parallelEnd = createVector(parallelStart.x + deltaX, parallelStart.y + deltaY);

      triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

      canvas.getContext("2d").clip();

      if (this.isBlack && this.showLines) { // Only show lines if both conditions are true
        for (let j = 0; j < 10; j++) {
          push();
          if (j % 2 == 0 && j < 5) { fill(0); } else { fill(255); }
          this.drawRectis(parallelStart.x + j * offset, parallelStart.y + j * offset,
            parallelEnd.x + j * offset, parallelEnd.y + j * offset);
          pop();
        }
      }
    } else {
      let isWhite = currentDigits.some(item => item[0] === this.i && item[1] === this.j);
      // Update target scale based on visibility
      this.targetScale = isWhite ? 1 : 0;

      // Animate scale
      this.scale = lerp(this.scale, this.targetScale, this.animationSpeed);

      // Apply scale transformation
      translate(this.w / 2, this.h / 2);
      scale(this.scale);
      translate(-this.w / 2, -this.h / 2);

      if (isWhite) {
        fill(0);
      } else {
        fill(255);
      }



      random10 = this.getRandomElements(isBlackTriangles, 20);



      // work out the orientation of the triangle based on column and row. 
      // checks if odd or even
      let invert = this.i % 2
      invert -= this.j % 2


      let slider = map(poster.posNormal.x, 0, 1, -20, 20)
      // draw
      if (invert) {

        let p1 = createVector(0, this.h / 2);
        let p2 = createVector(this.w, 0 - (this.h / 2))
        let p3 = createVector(this.w, this.h + (this.h / 2))

        let m = (p2.y - p1.y) / (p2.x - p1.x)

        let parallelStart = createVector(p1.x + slider, p1.y + slider);

        let deltaX = this.w + 100
        let deltaY = m * deltaX
        let parallelEnd = createVector(parallelStart.x + deltaX, parallelStart.y + deltaY)

        let rectWidth = (parallelEnd.x - parallelStart.x) / 2;
        let rectHeight = (parallelEnd.y - parallelStart.y) / 2;


        triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)


        canvas.getContext("2d").clip()


        if (isWhite) {
          for (let j = 0; j < 10; j++) {
            push()
            if (j % 2 == 0 && j < 5) { fill(0) } else { fill(255) }

            // this.drawRectis(parallelStart.x - j * rectWidth, parallelStart.y + j * rectHeight, parallelEnd.x - j * rectWidth, parallelEnd.y + j * rectHeight);
            this.drawRectis(parallelStart.x + j * offset, parallelStart.y + j * offset, parallelEnd.x + j * offset, parallelEnd.y + j * offset);
            pop()
          }

        }

      }

      else {
        let p4 = createVector(0, 0 - (this.h / 2))
        let p5 = createVector(this.w, this.h / 2)
        let p6 = createVector(0, this.h + (this.h / 2))

        let m = -(p5.y - p4.y) / (p5.x - p4.x)
        let parallelStart = createVector(p4.x - 20, p4.y);

        let deltaX = 200
        let deltaY = m * deltaX
        let parallelEnd = createVector(parallelStart.x + deltaX, parallelStart.y + deltaY)
        //	console.log('start x' + parallelStart.x + 'start y' + parallelStart.y)
        //	console.log('end x' + parallelEnd.x + 'end y' + parallelEnd.y)
        triangle(p4.x, p4.y, p5.x, p5.y, p6.x, p6.y);

        canvas.getContext("2d").clip()
      }
    }

    pop();

  }


  drawRectis(xx, yy, xe, ye) {
    push()
    noStroke();
    beginShape();
    vertex(xx, yy);
    vertex(xe, ye);
    vertex(xe + 40, ye + 20);
    vertex(xx + 40, yy + 20)
    endShape(CLOSE)
    pop()
  }


} 