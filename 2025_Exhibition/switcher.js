let parent = 'Student_Posters/'
let indexFile = '/index.html'
let posters = ['Team1', 'Team2', 'Team3', 'Team4', 'Team5', 'Team6', 'Team7']
let defaultPoster = 'PosterDefault';
// not used: 
let currentPoster = 0;
let intervalPosterChange = 240000; //4 minutes 
let intervalCountDown = 1000; //
let trackingActive = false;
let streaming = false;
let demoMode = false
let incrementCounterInterval;
let frames = []
let noFrames = 3;
let myInterval;
let countInterval;
let count = 0;
// event when page is finished loading

window.onload = function () {
  updateIframes();
  handleKeyEvents();
  adjustContainerSize();
  window.addEventListener('resize', function() {
    console.log("Window resized");
    adjustContainerSize();
  });
  // incrementCounterInterval = setInterval(incrementCounterDown, 2000); // Call incrementCounter every 1000 milliseconds (1 second)
  countInterval = setInterval(countHandler, intervalCountDown);
   myInterval = setInterval(intervalHandler, intervalPosterChange);
}

function adjustContainerSize() {
  console.log("resizing")
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

function handleKeyEvents() {
  // Listen for click events in the parent window
  window.addEventListener('mousedown', function (event) {
    if (event.button === 0) { // Check if the left mouse button was clicked
      console.log('Click detected in parent window');
      // make fullscreen
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

  function passMouseEventToParent(event) {
    window.dispatchEvent(new MouseEvent(event.type, event));
  }

  function passKeyEventToParent(event) {
    window.dispatchEvent(new KeyboardEvent(event.type, event));
  }


  for (var i = 0; i < frames.length; i++) {
    frames[i].contentWindow.addEventListener('mousedown', passMouseEventToParent);
    frames[i].contentWindow.addEventListener('keydown', passKeyEventToParent);
  }

}



function updateIframes() {
  // set numbers for the iframes
  for (var i = 0; i < noFrames; i++) {
    frames[i] = document.getElementById('screen' + i);
    // set the id of the body ellement in the iframe  
    frames[i].contentDocument.body.id = i;
  }
  count = 0;
  handleKeyEvents();
}



function changePoster(posterNo) {
  if (posterNo >= 0 && posterNo < posters.length && posterNo != null) {
    console.log("changing posters:" + posterNo)
    currentPoster = posterNo;
    let newPosterURL = parent + '' + posters[posterNo] + '' + indexFile
    console.log(newPosterURL);

    for (var i = 0; i < noFrames; i++) {
      let iframe = document.getElementById('screen' + i);
      iframe.src = newPosterURL;
      // add an event when the iframe is loaded
      iframe.onload = function () {
        updateIframes();
      
      }
    }

    // handling counting 
    // clearInterval(incrementCounterInterval);
    //  incrementCounterInterval = setInterval(incrementCounterDown, 2000); // Call incrementCounter every 1000 milliseconds (1 second)

  } else {
    console.log("changing posters:" + defaultPoster)
    currentPoster = posterNo;
    let newPosterURL = parent + '' + defaultPoster + '' + indexFile
    console.log(newPosterURL);

    for (var i = 0; i < noFrames; i++) {
      let iframe = document.getElementById('screen' + i);
      iframe.src = newPosterURL;
      // add an event when the iframe is loaded
      iframe.onload = function () {
        updateIframes();
      }
    }

  }
}

function incrementCounterDown() {

}

function incrementCounterUp() {

}


function pickPoster(number) {
  // for keyboard selection during testing
  if (number < posters.length && number >= 0) {
    console.log("poster no: " + number)
    transition(number)
  }
}

function transition(posterNo) {
  console.log("try transition animation")
  try {

    for (var i = 0; i < noFrames; i++) {
      let iframe = document.getElementById('screen' + i);
      // add an event when the iframe is loaded
      fadeOut(iframe, posterNo);
    }

  } catch (e) {
    console.log("transition failed " + e)
  }
}



function intervalHandler() {
  // console.log("streaming" + streaming + ", trackingActive" + trackingActive);
  //if (!trackingActive && streaming) {
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
  // console.log("streaming" + streaming + ", trackingActive" + trackingActive);
  //if (!trackingActive && streaming) {
  count++;
  if (count > 150) {
    count = 150;
  }
  clearInterval(countInterval);
  countInterval = setInterval(countHandler, intervalCountDown)

  // count needs to be three digits from 000 to 150
  let countString = count.toString().padStart(3, '0');

  // set numbers for the iframes
  for (var i = 0; i < noFrames; i++) {
    frames[i] = document.getElementById('screen' + i);
    // set the id of the body ellement in the iframe  
    // split countString into three parts
    let number = countString.charAt(i);
    try{
    frames[i].contentDocument.body.id = number;
    }catch(e){
      console.log("error setting body id: "+e)
    }
  }

}

function fadeOut(el, nextPosterNo) {
  let duration = 1000; // Animation duration in milliseconds.
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
  let duration = 1000; // Animation duration in milliseconds.
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

