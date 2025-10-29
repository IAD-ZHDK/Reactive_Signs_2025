/*import { Camera } from './webcam.js'
import { setupMoveNet, stopMoveNet, POSE_CONFIG, poses, AdjacentPairs } from './MoveNetTensorFlow.js'
import { webCamSketch } from './debugDisplay.js'
import { setUpGui, dragElement } from './GUI.js'
*/
import { recordCanvas, recordSetup, stopRecordCanvas, recording } from './recordCanvas.js'

import { setUpOSC, realsensePos, OSCdepthData, OSCdepthW, OSCdepthH, OSCtracking, oscSignal } from './OSC_Control.js'
import { debugInfo } from './debugInfo.js'
import globalVariables from './globalVariables';

// Quick check to confirm this module is loaded in the browser
try {
  console.log("library/src/index.js loaded");
  window.__reactive_signs_library_loaded = true;
} catch (e) {
  // ignore in environments without console/window
}

try {
  if (typeof p5 === 'undefined') {
    console.warn('p5 is NOT defined at module load time');
  } else {
    console.log('p5 is defined, version:', p5.VERSION, 'registerMethod?', typeof p5.prototype.registerMethod);
  }
} catch (e) {
  console.error('Error checking p5 availability', e);
}

let currentNumber = 9;
let fullscreenMode = false;
let windowInstance;
let animationLoopEnabled = false;
let debug = true
let enableDepth = true;
let incrementCounterInterval;
let fadingIn = 255;
let exhibitionMode = false;
let idx = 0; // canvas index for multi-canvas setups
let manualCounter = false;

/// hooks
function libraryInit() {
  console.log("P5 version" + p5.VERSION);
  console.log("init");
  this.poster = this.poster || {};
  let instance = this;
  globalVariables.position = p5.prototype.createVector(0, 0, 0);
  globalVariables.posNormal = p5.prototype.createVector(0, 0, 0);
  windowInstance = window;
  setUpOSC(enableDepth);
  this.poster.position = globalVariables.position;
  this.poster.posNormal = globalVariables.posNormal;
  this.poster.currentNumber = 0;
  incrementCounterInterval = setInterval(incrementCounter(instance), 2000); // Call incrementCounter every 1000 milliseconds (1 second)
}

function beforeSetup() {
  updateViewportVariables(this);
  this.width = getWindowWidth();
  this.height = getWindowWidth();

}
function afterSetup() {
  let P5Instance = this;
  resizeCanvas(P5Instance);
  recordSetup(enableDepth);


  windowInstance.addEventListener('fullscreenchange', (event) => { // 
    // document.fullscreenElement will point to the element that
    // is in fullscreen mode if there is one. If there isn't one,
    // the value of the property is null.
    if (document.fullscreenElement) {
      console.log(`Element: ${document.fullscreenElement.id} entered full-screen mode.`);
      fullscreenMode = true;
      exhibitionMode = true;
      debug = false;
      resizeCanvas(P5Instance);
    } else {
      console.log('Leaving full-screen mode.');
      fullscreenMode = false;
      exhibitionMode = false;
      debug = true;
      resizeCanvas(P5Instance);
    }

  });

  windowInstance.addEventListener("resize", (event) => {
    resizeCanvas(P5Instance);
  });

  P5Instance.mousePressed = function () {
    if (P5Instance.mouseX > 0 && P5Instance.mouseY > 0 && P5Instance.mouseX < P5Instance.width && P5Instance.mouseY < P5Instance.height) {
      openFullscreen(P5Instance);
    }

  }


  const pressed = new Set();

  P5Instance.keyPressed = function (evt) {
    if (!exhibitionMode) {
      const { code } = evt;
      if (!pressed.has(code)) {
        pressed.add(code);
        console.log(pressed);
        if (pressed.has("Shift") || pressed.has("ShiftLeft") && pressed.has("KeyR") && !recording) {
          recordCanvas();
        }
        if (pressed.has("Shift") || pressed.has("ShiftLeft") && pressed.has("KeyS") && recording) {
          stopRecordCanvas();
        }
        // handle counter 
        if (pressed.has("ArrowUp")) {
          // stop this instance auto-decrement and step counter immediately
          if (incrementCounterInterval) {
            clearInterval(incrementCounterInterval);
            incrementCounterInterval = null;
          }
          // decrement this instance counter immediately (preserve original behavior)

          if (P5Instance.poster.currentNumber > 0) {
            P5Instance.poster.currentNumber--;
          } else {
            P5Instance.poster.currentNumber = 9;
          }
          manualCounter = true;
        } else if (pressed.has("ArrowDown")) {
          if (incrementCounterInterval) {
            clearInterval(incrementCounterInterval);
            incrementCounterInterval = null;
          }
          if (P5Instance.poster.currentNumber < 9) {
            P5Instance.poster.currentNumber++;
          } else {
            P5Instance.poster.currentNumber = 0;
          }
          manualCounter = true;
        }
        if (pressed.has("ShiftLeft") && pressed.has("KeyP")) {
          debug = !debug;
        }
      }
    }
  }

  P5Instance.keyReleased = function (evt) {
    pressed.delete(evt.code);
  }



}

function libraryPreDraw() {

  // update variables 
  let P5Instance = this;
  updateViewportVariables(this)

  this.poster.counter = getCounterInternal(this);
  /*
if (poses != undefined && Settings.poseDetection == true) {
  handlePosenet();
} else 
*/
  if (oscSignal && realsensePos != undefined) {
    // realsense data available over osc
    updatePosition(P5Instance, realsensePos.x, realsensePos.y, realsensePos.z)
    if (enableDepth) {
      this.poster.depthData = OSCdepthData;
      this.poster.depthW = OSCdepthW; // width of data array
      this.poster.depthH = OSCdepthH; // width of height array
    }

  } else {
    // just use mouse
    let mouseX = P5Instance.mouseX / P5Instance.width;
    mouseX = P5Instance.constrain(mouseX, 0, 1)
    let mouseY = P5Instance.mouseY / P5Instance.height;
    mouseY = P5Instance.constrain(mouseY, 0, 1)
    updatePosition(P5Instance, mouseX, mouseY, 1.0)
  }
  // light animation when tracking is false
  if (animationLoopEnabled && OSCtracking != true && oscSignal == true) {
    let oscolation = 0.08 * sin(P5Instance.frameCount / (P5Instance.PI * 50));
    updatePosition(P5Instance, .5 + oscolation, .5, 1.0)
  }
  // show helplines when outside of fullscreen mode
}
function libraryPostDraw() {
  let P5Instance = this;

  // Call attachToInstance once (when canvas first exists)
  if (!P5Instance._libStateInitialized) {
    try {
      if (typeof P5Instance.attachToInstance === 'function') {
        P5Instance.attachToInstance(P5Instance);
        P5Instance._libStateInitialized = true;
      }
    } catch (e) {
      console.warn('attachToInstance failed', e);
    }
  }

  // Attach this p5 instance to its canvas (do this once, early in postDraw)
  try {
    if (P5Instance._renderer && P5Instance._renderer.canvas && !P5Instance._renderer.canvas._p5Instance) {
      P5Instance._renderer.canvas._p5Instance = P5Instance;
      console.log('Attached p5 instance to canvas:', P5Instance._renderer.canvas.id);
    }
  } catch (e) {
    console.warn('Could not attach p5 instance to canvas', e);
  }

  /// --- start: per-canvas poster offset setup ---
  try {
    const canvas = P5Instance._renderer && P5Instance._renderer.canvas;
    if (canvas) {
      const canvasID = canvas.id || '';
      // get the number at the end of the id attribute, after 'canvas' or 'Canvas'
      const canvasNumber = parseInt((canvasID || '').replace(/\D/g, '')) || 0;
      // store per-instance index instead of mutating global idx
      P5Instance._canvasIndex = canvasNumber;
    } else {
      P5Instance._canvasIndex = P5Instance._canvasIndex || 0;
    }
  } catch (e) {
    P5Instance._canvasIndex = P5Instance._canvasIndex || 0;
  }



  if (!fullscreenMode && debug) {
    P5Instance.cursor()
    // gui.show();
    // showWebCamPreview(true);
    // draw debug info
    debugInfo(this);
  } else {
    P5Instance.noCursor();
    //gui.hide();
    //showWebCamPreview(false);
  }
  //if (exhibitionMode) {
  // gui.hide();
  // showWebCamPreview(false);
  // }
  // show light animation when no one is infront of the camera

  // fade in at start;
  if (fadingIn > 0) {
    let color = P5Instance.color(0, 0, 0, fadingIn);
    P5Instance.push();
    if (P5Instance._renderer.drawingContext instanceof WebGL2RenderingContext) {
      P5Instance.translate(-P5Instance.width / 2, -P5Instance.height / 2, 500);
    }
    fadingIn -= 1;
    P5Instance.fill(color);
    P5Instance.rect(0, 0, P5Instance.width, P5Instance.height);
    P5Instance.pop();
  }

}

// custom private methods
function resizeCanvas(P5Instance) {
  // cameraSave(); // work around for play.js
  P5Instance.resizeCanvas(getWindowWidth(), getWindowHeight());
  updateViewportVariables(P5Instance);
  try {
    P5Instance.windowResized();
  } catch (e) {
  }
}

function getCounter() {
  // cameraSave(); // work around for play.js
  return this.counter;
}



p5.prototype.poster.getCounter = function () {
  return this.counter;
}



function updatePosition(P5Instance, x, y, z) {
  // position data and smoothing
  let factor = 0.9;
  globalVariables.posNormal.mult(factor)
  globalVariables.posNormal.x += x * (1 - factor);
  globalVariables.posNormal.y += y * (1 - factor);
  globalVariables.posNormal.z += z * (1 - factor);
  globalVariables.position.x = globalVariables.posNormal.x * P5Instance.width;
  globalVariables.position.y = globalVariables.posNormal.y * P5Instance.height;
  globalVariables.position.z = globalVariables.posNormal.z;
}

function updateViewportVariables(P5Instance) {
  let w = getWindowWidth();
  let h = getWindowHeight();
  let offsetX = 0;
  let offsetY = 0;
  try {
    if (P5Instance._renderer.drawingContext instanceof WebGLRenderingContext) {
      offsetX = - Math.floor(w / 2)
      offsetY = - Math.floor(h / 2)
    }
  }
  catch (e) {

  }

  for (let i = 0; i < globalVariables.screens.length; i++) {
    globalVariables.screens[i].w = P5Instance.floor(w / globalVariables.screens.length);
    globalVariables.screens[i].h = h;
    globalVariables.screens[i].x = globalVariables.screens[i].w * i;
    globalVariables.screens[i].y = 0;
    globalVariables.screens[i].cntX = globalVariables.screens[i].x + globalVariables.screens[i].w / 2;
    globalVariables.screens[i].cntY = globalVariables.screens[i].h / 2;
  }
  globalVariables.vw = w * 0.01; // 1 percent of viewport width;
  globalVariables.vh = h * 0.01;// 1 percent of viewport height;  


  // determine per-instance index (fallback to 0)
  const canvasIdx = (P5Instance && typeof P5Instance._canvasIndex === 'number') ? P5Instance._canvasIndex : 0;

  //offset 
  // This is for three poster setup, to offset each poster slightly horizontally
  let newX = globalVariables.posNormal.x
  let offset = 0.2;
  let startX = 0.0 + (canvasIdx * offset);
  let endX = 1.0 - (offset * 2) + (canvasIdx * offset)

  newX = P5Instance.constrain(newX, startX, endX);
  newX = P5Instance.map(newX, startX, endX, 0.0, 1.0);

  let xScaled = newX * P5Instance.width;

  P5Instance.poster.position = globalVariables.position.copy();
  P5Instance.poster.posNormal = globalVariables.posNormal.copy();
  P5Instance.poster.position.x = xScaled;
  P5Instance.poster.posNormal.x = newX;
  P5Instance.poster.vh = globalVariables.vh;
  P5Instance.poster.vw = globalVariables.vw;
  P5Instance.poster.screens = globalVariables.screens;
}

function getWindowWidth() {
  let posterWidth;
  let displayWidth = window.innerWidth;
  let displayHeight = window.innerHeight;

  let aspectRatioWH = globalVariables.pageWidth / globalVariables.pageHeight; // width to height
  let aspectRatioHW = globalVariables.pageHeight / globalVariables.pageWidth; // height to width

  let currentRatio = displayWidth / displayHeight;

  if (displayWidth < displayHeight * aspectRatioWH) {
    // for portrait mode
    posterWidth = displayWidth;
  } else {
    // for landscape mode
    posterWidth = Math.floor(displayHeight * aspectRatioWH);
  }
  return posterWidth;
}

function getWindowHeight() {
  let posterHeight;
  let displayWidth = window.innerWidth;
  let displayHeight = window.innerHeight;
  let aspectRatioWH = globalVariables.pageWidth / globalVariables.pageHeight; // width to height
  let aspectRatioHW = globalVariables.pageHeight / globalVariables.pageWidth; // height to width
  if (displayWidth < displayHeight * aspectRatioWH) {
    // for portrait mode
    posterHeight = Math.floor(displayWidth * aspectRatioHW);
  } else {
    // for landscape mode
    posterHeight = displayHeight;
  }

  if (displayHeight == screen.height || displayWidth == screen.height || displayWidth == screen.width || displayHeight == screen.width) {
    fullscreenMode = true;
    debug = false;
  } else {
    fullscreenMode = false;
  }

  return posterHeight;
}

// custom public methods 
p5.prototype.poster = class {
};
/*
p5.prototype.poster.getCounter = function () {
  // check if body has id, if id does, than return id number
  // if body id doesn't exist return currentNumber, then check canvas for ID attribute

  // check body id first
  try {
    const body = document.querySelector('body');
    const bodyId = body && body.getAttribute && body.getAttribute('id');
    if (!isNaN(bodyId) && bodyId !== null) {
      exhibitionMode = true;
      return parseInt(bodyId, 10);
    }
  } catch (e) {
    // ignore and continue
  }

  // Find the canvas that belongs to THIS p5 instance (prefer renderer.canvas)
  let canvas = null;
  if (this && this._renderer && this._renderer.canvas) {
    canvas = this._renderer.canvas;
  } else {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    for (const c of canvases) {
      // some embeds attach the p5 instance to the canvas under various props
      if (c._p5Instance === this || c._pInst === this || c.pInst === this) {
        canvas = c;
        break;
      }
    }
  }

  let canvasNumber = null;
  try {
    if (canvas) canvasNumber = canvas.getAttribute('number');
  } catch (e) { canvasNumber = null; }

  if (!isNaN(canvasNumber) && canvasNumber !== null) {
    exhibitionMode = true;
    return parseInt(canvasNumber, 10);
  }

  // fallback to per-instance counter if available, otherwise global
  if (this && this._libState && typeof this._libState.counter === 'number') {
    return this._libState.counter;
  }
  return currentNumber;
}
*/


function incrementCounter(P5Instance) {
  if (P5Instance.poster.currentNumber > 0) {
    P5Instance.poster.currentNumber--;
  } else {
    P5Instance.poster.currentNumber = 9;
  }
}
function deincrementCounter(P5Instance) {
  if (P5Instance.poster.currentNumber < 9) {
    P5Instance.poster.currentNumber++;
  } else {
    P5Instance.poster.currentNumber = 0;
  }
}

function openFullscreen(P5Instance) {
  let elem = document.documentElement
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen()
  }
}


// replace the registerMethod block at the bottom with guarded registration
try {
  if (typeof p5 !== 'undefined' && typeof p5.prototype.registerMethod === 'function') {
    p5.prototype.registerMethod("init", libraryInit);
    p5.prototype.registerMethod("post", libraryPostDraw);
    p5.prototype.registerMethod("pre", libraryPreDraw);
    p5.prototype.registerMethod("afterSetup", afterSetup);
    p5.prototype.registerMethod("beforeSetup", beforeSetup);
    console.log('library hooks registered');
  } else {
    console.warn('Could not register p5 hooks — p5 or registerMethod missing');
  }
} catch (err) {
  console.error('Failed to register p5 hooks:', err);
}



function getCounterInternal(instance) {

  // check if body has id, if id does, than return id number
  // if body id doesn't exist return currentNumber, then check canvas for ID attribute
  let body = document.querySelector('body');
  let bodyId = body.getAttribute('id');

  // Safely get canvas element - try multiple approaches
  let canvas = null;
  let canvasNumber = null;

  // First try to get from p5 instance
  if (instance._renderer && instance._renderer.canvas) {
    canvas = instance._renderer.canvas;
    //console.log("Found canvas from p5 instance", canvas);
  } else {
    // Fallback to DOM query
    canvas = document.querySelector('canvas');
  }

  if (canvas) {
    canvasNumber = canvas.getAttribute('number');
    //console.log("canvasNumber", canvasNumber);
  }


  if (!isNaN(bodyId) && bodyId != null) {
    // check that bodyID is not null
    // hide debug info
    // debug = false
    exhibitionMode = true;
    // convert bodyId to number
    bodyId = parseInt(bodyId);
    return bodyId;
  } else if (!isNaN(canvasNumber) && canvasNumber != null) {
    //console.log("canvasNumber", canvasNumber);
    // check that bodyID is not null
    // hide debug info;
    //debug = false
    exhibitionMode = true;
    // convert bodyId to number
    canvasNumber = parseInt(canvasNumber);
    return canvasNumber;
  } else {
    return currentNumber;
  }
}

// counter specific functions
p5.prototype.attachToInstance = function (inst) {

  inst.poster.getCounter = function () {
    return inst._libState.counter;
  };

  inst._libState = inst._libState || {
    counter: currentNumber,
    lastUpdate: Date.now(),
    _interval: null,
  };

  inst.poster = inst.poster || {};

  // Find the container div that this instance was created in
  let myContainer = null;
  if (inst.canvas && inst.canvas.parentElement) {
    myContainer = inst.canvas.parentElement;
  }
  const containerId = (myContainer && myContainer.id) || 'unknown';
  console.log('attachToInstance: instance canvas parent container id:', containerId);


  inst.poster.setCounter = function (v) {
    inst._libState.counter = v;
  };

  if (!inst._libState._interval) {
    inst._libState._interval = setInterval(() => {
      if (!manualCounter) {
        if (inst._libState.counter > 0) {
          inst._libState.counter--;
        } else {
          inst._libState.counter = 9;
        }
      }
    }, 2000);
  }
};