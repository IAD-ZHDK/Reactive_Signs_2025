let noFrames = 3;
let p5Instances = [];
let currentSketchFunction = null;
let loadedScripts = new Set(); // Track loaded script files

let posters = ['Team1', 'Team2', 'Team3', 'Team4', 'Team5', 'Team6', 'Team7']
let defaultPoster = 'PosterDefault';
let currentPoster = 0;
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
    let canvasDiv = document.getElementById('canvas' + i);
    canvasDiv.innerHTML = '';
  }

  // Force garbage collection hint
  if (window.gc) {
    window.gc();
  }
}

// Function to create p5 instances with the current sketch
function createInstances() {
  if (!currentSketchFunction) {
    console.error("No sketch function loaded");
    return;
  }

  for (let i = 0; i < noFrames; i++) {
    // Create poster object for each instance
    let poster = {
      getCounter: () => i,
      position: { x: 0, y: 0 },
      vw: 1,
      vh: 1
    };

    let sketchWithPoster = function (p) {
      p.poster = poster;
      currentSketchFunction(p);
    };

    p5Instances[i] = new p5(sketchWithPoster, 'canvas' + i);
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
      let canvasDiv = document.getElementById('canvas' + i);
      fadeOut(canvasDiv, posterNo);
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
    let canvasDiv = document.getElementById('canvas' + i);
    let canvasElement = canvasDiv.querySelector('canvas');
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