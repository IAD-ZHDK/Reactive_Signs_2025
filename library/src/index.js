/*import { Camera } from './webcam.js'
import { setupMoveNet, stopMoveNet, POSE_CONFIG, poses, AdjacentPairs } from './MoveNetTensorFlow.js'
import { webCamSketch } from './debugDisplay.js'
import { setUpGui, dragElement } from './GUI.js'
*/
import { recordCanvas, recordSetup, stopRecordCanvas, recording } from './recordCanvas.js'

import { setUpOSC, realsensePos, OSCdepthData, OSCdepthW, OSCdepthH, OSCtracking, oscSignal } from './OSC_Control.js'
import { debugInfo } from './debugInfo.js'
import globalVariables from './globalVariables';

import packageInfo from "../package.json";

let webCamWrapper;
let currentNumber = 9;
let fullscreenMode = false;
let windowInstance;
let animationLoopEnabled = false;
let debug = true
let enableDepth = true;
let incrementCounterInterval;
let manualCounter = false;
let fadingIn = 255;
let fadingOut = false;
let exhibitionMode = false;
let idx = 0; // canvas index for multi-canvas setups
let libraryFont

/// hooks
function libraryInit() {
  console.log("P5 version" + p5.VERSION);
  console.log("init");
  this.poster = this.poster || {};
  globalVariables.position = p5.prototype.createVector(0, 0, 0);
  globalVariables.posNormal = p5.prototype.createVector(0, 0, 0); // normalised
  windowInstance = window;
  setUpOSC(enableDepth);
  this.poster.position = globalVariables.position;
  this.poster.posNormal = globalVariables.posNormal;
  incrementCounterInterval = setInterval(incrementCounter, 2000); // Call incrementCounter every 1000 milliseconds (1 second)
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
      resizeCanvas(P5Instance);
    } else {
      console.log('Leaving full-screen mode.');
      fullscreenMode = false;
      resizeCanvas(P5Instance);
    }
  });

  windowInstance.addEventListener("resize", (event) => {
    resizeCanvas(P5Instance);
  });

  P5Instance.mousePressed = function () {
    if (P5Instance.mouseButton === P5Instance.LEFT & exhibitionMode == false) {
      if (P5Instance.mouseX > 0 && P5Instance.mouseY > 0 && P5Instance.mouseX < P5Instance.width && P5Instance.mouseY < P5Instance.height) {
        openFullscreen(P5Instance);
      }
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
          // cancel incrementCounter interval and increase counter by 1
          clearInterval(incrementCounterInterval);
          incrementCounter();
          manualCounter = true;
        } else if (pressed.has("ArrowDown")) {
          clearInterval(incrementCounterInterval);
          deincrementCounter();
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



  /// --- start: per-canvas poster offset setup ---
  try {
    const canvas = P5Instance._renderer && P5Instance._renderer.canvas;
    const canvasID = canvas.id
    // get the number at the end of the id attribute, after 'canvas' or 'Canvas'
    const canvasNumber = parseInt(canvasID.replace(/\D/g, ''));
    idx = canvasNumber;
    //console.log("canvas index:", idx);
  } catch (e) {
    idx = 0;
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


  //offset 
  // This is for three poster setup, to offset each poster slightly horizontally
  let x = globalVariables.posNormal.x
  let offset = 0.2;
  let startX = 0.0 + (idx * offset);
  let endX = 1.0 - (offset * 2)
  console.log("x ", globalVariables.posNormal.x);
  x = P5Instance.constrain(x, startX, endX);
  x = P5Instance.map(x, startX, endX, 0.0, 1.0);
  let xScaled = x * P5Instance.width;

  P5Instance.poster.position.x = xScaled;
  P5Instance.poster.posNormal.x = x;
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
  } else {
    fullscreenMode = false;
  }

  return posterHeight;
}

// custom public methods 
p5.prototype.poster = class {
};

p5.prototype.poster.getCounter = function () {
  // check if body has id, if id does, than return id number
  // if body id doesn't exist return currentNumber, then check canvas for ID attribute
  let body = document.querySelector('body');
  let bodyId = body.getAttribute('id');

  // Safely get canvas element - try multiple approaches
  let canvas = null;
  let canvasId = null;

  // First try to get from p5 instance
  if (this._renderer && this._renderer.canvas) {
    canvas = this._renderer.canvas;
  } else {
    // Fallback to DOM query
    canvas = document.querySelector('canvas');
  }

  if (canvas) {
    canvasId = canvas.getAttribute('number');
  }

  // console.log("bodyId", bodyId);
  // console.log("canvasId", canvasId);
  // console.log("canvas element:", canvas); // Add this to debug

  if (!isNaN(bodyId) && bodyId != null) {
    // check that bodyID is not null
    // hide debug info
    debug = false
    exhibitionMode = true;
    // convert bodyId to number
    bodyId = parseInt(bodyId);
    return bodyId;
  } else if (!isNaN(canvasId) && canvasId != null) {
    // check that bodyID is not null
    // hide debug info;
    debug = false
    exhibitionMode = true;
    // convert bodyId to number
    canvasId = parseInt(canvasId);
    return canvasId;
  }
  else {
    return currentNumber;
  }
}

// register hooks

p5.prototype.registerMethod("init", libraryInit);
p5.prototype.registerMethod("post", libraryPostDraw);
p5.prototype.registerMethod("pre", libraryPreDraw);
p5.prototype.registerMethod("afterSetup", afterSetup);
p5.prototype.registerMethod("beforeSetup", beforeSetup);
/*
p5.prototype.myAddon.MyClass = class {

};
*/

// counter specific functions 


function incrementCounter() {
  if (currentNumber > 0) {
    currentNumber--;
  } else {
    currentNumber = 9;
  }
}
function deincrementCounter() {
  if (currentNumber < 9) {
    currentNumber++;
  } else {
    currentNumber = 0;
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