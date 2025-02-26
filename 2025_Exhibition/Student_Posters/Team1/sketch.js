//import { setFlagsFromString } from "v8";

let zeroTop;
let zeroMiddle;
let zeroBottom;
let nineTop;
let nineMiddle;
let nineMiddle2;
let nineBottom;
let eightTop;
let eightMiddle;
let eightBottom;
let sevenTop;
let sevenMiddle;
let sevenBottom;
let sixTop;
let sixMiddle;
let sixMiddle2;
let sixBottom;
let fiveTop;
let fiveMiddle;
let fiveBottom;
let fourTop;
let fourBottom;
let threeTop;
let threeMiddle;
let threeBottom;
let twoTop;
let twoMiddle;
let twoBottom;
let oneTop;
let oneBottom;
let transitionSpeed = 0.25;
let phase = 0; // 0: Reinfliegen, 1: Rausfliegen

// Aktuelle und Zielpositionen für die Modelle
let zeroTopPosition = { x: 0, y: 0, z: 0 };
let zeroMiddlePosition = { x: 0, y: 0, z: 0 };
let zeroBottomPosition = { x: 0, y: 0, z: 0 };

let nineTopPosition = { x: 0, y: 0, z: 0 };
let nineMiddlePosition = { x: 0, y: 0, z: 0 };
let nineMiddle2Position = { x: 0, y: 0, z: 0 };
let nineBottomPosition = { x: 0, y: 0, z: 0 };

let eightTopPosition = { x: 0, y: 0, z: 0 };
let eightMiddlePosition = { x: 0, y: 0, z: 0 };
let eightBottomPosition = { x: 0, y: 0, z: 0 };

let sevenTopPosition = { x: 0, y: 0, z: 0 };
let sevenMiddlePosition = { x: 0, y: 0, z: 0 };
let sevenBottomPosition = { x: 0, y: 0, z: 0 };

let sixTopPosition = { x: 0, y: 0, z: 0 };
let sixMiddlePosition = { x: 0, y: 0, z: 0 };
let sixMiddle2Position = { x: 0, y: 0, z: 0 };
let sixBottomPosition = { x: 0, y: 0, z: 0 };

let fiveTopPosition = { x: 0, y: 0, z: 0 };
let fiveMiddlePosition = { x: 0, y: 0, z: 0 };
let fiveBottomPosition = { x: 0, y: 0, z: 0 };

let fourTopPosition = { x: 0, y: 0, z: 0 };
let fourBottomPosition = { x: 0, y: 0, z: 0 };

let threeTopPosition = { x: 0, y: 0, z: 0 };
let threeMiddlePosition = { x: 0, y: 0, z: 0 };
let threeBottomPosition = { x: 0, y: 0, z: 0 };

let twoTopPosition = { x: 0, y: 0, z: 0 };
let twoMiddlePosition = { x: 0, y: 0, z: 0 };
let twoBottomPosition = { x: 0, y: 0, z: 0 };

let oneTopPosition = { x: 0, y: 0, z: 0 };
let oneBottomPosition = { x: 0, y: 0, z: 0 };

// Zielpositionen
let zeroTarget = {
  top: { x: 0, y: 0, z: 0 },
  middle: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};
let nineTarget = {
  top: { x: 0, y: 0, z: 0 },
  middle: { x: 0, y: 0, z: 0 },
  middle2: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};
let eightTarget = {
  top: { x: 0, y: 0, z: 0 },
  middle: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};
let sevenTarget = {
  top: { x: 0, y: 0, z: 0 },
  middle: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};
let sixTarget = {
  top: { x: 0, y: 0, z: 0 },
  middle: { x: 0, y: 0, z: 0 },
  middle2: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};
let fiveTarget = {
  top: { x: 0, y: 0, z: 0 },
  middle: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};
let fourTarget = {
  top: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};
let threeTarget = {
  top: { x: -20, y: 0, z: 0 },
  middle: { x: 20, y: 0, z: 0 },
  bottom: { x: 5, y: -15, z: 0 },
};
let twoTarget = {
  top: { x: 0, y: 0, z: 0 },
  middle: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};
let oneTarget = {
  top: { x: 0, y: 0, z: 0 },
  bottom: { x: 0, y: 0, z: 0 },
};

let lastShiftTime = 0;
let lastMouseX = 0;
let rotationAngle = 0;

// Zustände für das Countdown-System
let state;
let font;

function preload() {
  zeroTop = loadModel("objects/0Top.obj");
  zeroMiddle = loadModel("objects/0Middle.obj");
  zeroBottom = loadModel("objects/0Bottom.obj");

  nineTop = loadModel("objects/9Top.obj");
  nineMiddle = loadModel("objects/9Middle1.obj");
  nineMiddle2 = loadModel("objects/9Middle2.obj");
  nineBottom = loadModel("objects/9Bottom.obj");

  eightTop = loadModel("objects/8Top.obj");
  eightMiddle = loadModel("objects/8Middle.obj");
  eightBottom = loadModel("objects/8Bottom.obj");

  sevenTop = loadModel("objects/7Top.obj");
  sevenMiddle = loadModel("objects/7Middle.obj");
  sevenBottom = loadModel("objects/7Bottom.obj");

  sixTop = loadModel("objects/6Top.obj");
  sixMiddle = loadModel("objects/6Middle1.obj");
  sixMiddle2 = loadModel("objects/6Middle2.obj");
  sixBottom = loadModel("objects/6Bottom.obj");

  fiveTop = loadModel("objects/5Top.obj");
  fiveMiddle = loadModel("objects/5Middle.obj");
  fiveBottom = loadModel("objects/5Bottom.obj");

  fourTop = loadModel("objects/4Top.obj");
  fourBottom = loadModel("objects/4Bottom.obj");

  threeTop = loadModel("objects/3top.obj");
  threeMiddle = loadModel("objects/3middle.obj");
  threeBottom = loadModel("objects/3bottom.obj");

  twoTop = loadModel("objects/2Top.obj");
  twoMiddle = loadModel("objects/2Middle.obj");
  twoBottom = loadModel("objects/2Bottom.obj");

  oneTop = loadModel("objects/1Top.obj");
  oneBottom = loadModel("objects/1Bottom.obj");
  font = loadFont('barlow_condensed.otf');
}


function setup() {
  /*important!*/ createCanvas(100, 100, WEBGL); // Don't remove this line. 
  textFont(font)
}

function draw() {
  background(0);
  fill(255)
  noStroke()
  ambientLight(255);
  ambientMaterial(255, 255, 255);

  state = poster.getCounter();

  /*let isoX = 0;
  let isoY = 0;
  let isoZ = 500;
  camera(isoX, isoY, isoZ, 0, 0, 0, 0, 1, 0);*/

  let isoX = 300;
  let isoY = 0;
  let isoZ = 300;
  camera(isoX, isoY, isoZ, 0, 0, 0, 0, 1, 0);


  inactivateTarget(zeroTarget, nineTarget, eightTarget, sevenTarget, sixTarget, fiveTarget, fourTarget, threeTarget, twoTarget, oneTarget)

  setTarget(state);

  lastShiftTime = millis();


 
  if (poster.position.x !== lastMouseX) {
    let normalizedPosterX = map(poster.position.x, -width / 2, width / 2, -1, 1); // Map poster.position.x to a range of -1 to 1
    rotationAngle = -normalizedPosterX * PI; // Rotate to face left or right depending on position
    lastMouseX = poster.position.x;
  }

  interpolateAll();

  let flipAngle = PI;
  scale(poster.vw*9);


  if (state == 0) {
    renderModel(zeroTop, zeroMiddle, zeroBottom, zeroTopPosition, zeroMiddlePosition, zeroBottomPosition, flipAngle);
  } else if (state == 1) {
    renderModel(nineTop, nineMiddle, nineBottom, nineTopPosition, nineMiddlePosition, nineBottomPosition, flipAngle, nineMiddle2, nineMiddle2Position);
  } else if (state == 2) {
    renderModel(eightTop, eightMiddle, eightBottom, eightTopPosition, eightMiddlePosition, eightBottomPosition, flipAngle);
  } else if (state == 3) {
    renderModel(sevenTop, sevenMiddle, sevenBottom, sevenTopPosition, sevenMiddlePosition, sevenBottomPosition, flipAngle);
  } else if (state == 4) {
    renderModel(sixTop, sixMiddle, sixBottom, sixTopPosition, sixMiddlePosition, sixBottomPosition, flipAngle, sixMiddle2, sixMiddle2Position);
  } else if (state == 5) {
    renderModel(fiveTop, fiveMiddle, fiveBottom, fiveTopPosition, fiveMiddlePosition, fiveBottomPosition, flipAngle);
  } else if (state == 6) {
    renderModel(fourTop, null, fourBottom, fourTopPosition, null, fourBottomPosition, flipAngle);
  } else if (state == 7) {
    renderModel(threeTop, threeMiddle, threeBottom, threeTopPosition, threeMiddlePosition, threeBottomPosition, flipAngle);
  } else if (state == 8) {
    renderModel(twoTop, twoMiddle, twoBottom, twoTopPosition, twoMiddlePosition, twoBottomPosition, flipAngle);
  } else if (state == 9) {
    renderModel(oneTop, null, oneBottom, oneTopPosition, null, oneBottomPosition, flipAngle);
  }

}

function interpolateAll(){
 // Interpolationen
 zeroTopPosition = interpolatePosition(zeroTopPosition, zeroTarget.top);
 zeroMiddlePosition = interpolatePosition(zeroMiddlePosition, zeroTarget.middle);
 zeroBottomPosition = interpolatePosition(zeroBottomPosition, zeroTarget.bottom);

 nineTopPosition = interpolatePosition(nineTopPosition, nineTarget.top);
 nineMiddlePosition = interpolatePosition(nineMiddlePosition, nineTarget.middle);
 nineMiddle2Position = interpolatePosition(nineMiddle2Position, nineTarget.middle2);
 nineBottomPosition = interpolatePosition(nineBottomPosition, nineTarget.bottom);

 eightTopPosition = interpolatePosition(eightTopPosition, eightTarget.top);
 eightMiddlePosition = interpolatePosition(eightMiddlePosition, eightTarget.middle);
 eightBottomPosition = interpolatePosition(eightBottomPosition, eightTarget.bottom);

 sevenTopPosition = interpolatePosition(sevenTopPosition, sevenTarget.top);
 sevenMiddlePosition = interpolatePosition(sevenMiddlePosition, sevenTarget.middle);
 sevenBottomPosition = interpolatePosition(sevenBottomPosition, sevenTarget.bottom);

 sixTopPosition = interpolatePosition(sixTopPosition, sixTarget.top);
 sixMiddlePosition = interpolatePosition(sixMiddlePosition, sixTarget.middle);
 sixMiddle2Position = interpolatePosition(sixMiddle2Position, sixTarget.middle2);
 sixBottomPosition = interpolatePosition(sixBottomPosition, sixTarget.bottom);

 fiveTopPosition = interpolatePosition(fiveTopPosition, fiveTarget.top);
 fiveMiddlePosition = interpolatePosition(fiveMiddlePosition, fiveTarget.middle);
 fiveBottomPosition = interpolatePosition(fiveBottomPosition, fiveTarget.bottom);

 fourTopPosition = interpolatePosition(fourTopPosition, fourTarget.top);
 fourBottomPosition = interpolatePosition(fourBottomPosition, fourTarget.bottom);

 threeTopPosition = interpolatePosition(threeTopPosition, threeTarget.top);
 threeMiddlePosition = interpolatePosition(threeMiddlePosition, threeTarget.middle);
 threeBottomPosition = interpolatePosition(threeBottomPosition, threeTarget.bottom);

 twoTopPosition = interpolatePosition(twoTopPosition, twoTarget.top);
 twoMiddlePosition = interpolatePosition(twoMiddlePosition, twoTarget.middle);
 twoBottomPosition = interpolatePosition(twoBottomPosition, twoTarget.bottom);

 oneTopPosition = interpolatePosition(oneTopPosition, oneTarget.top);
 oneBottomPosition = interpolatePosition(oneBottomPosition, oneTarget.bottom);

}

function renderModel(top, middle, bottom, topPos, middlePos, bottomPos, flip, middle2 = null, middle2Pos = null) {
  if (top) {
    push();
    translate(topPos.x, topPos.y, topPos.z);
    rotateX(flip);
    rotateY(rotationAngle);
    model(top);
    pop();
  }
  if (middle) {
    push();
    translate(middlePos.x, middlePos.y, middlePos.z);
    rotateX(flip);
    rotateY(rotationAngle);
    model(middle);
    pop();
  }
  if (middle2) {
    push();
    translate(middle2Pos.x, middle2Pos.y, middle2Pos.z);
    rotateX(flip);
    rotateY(rotationAngle);
    model(middle2);
    pop();
  }
  if (bottom) {
    push();
    translate(bottomPos.x, bottomPos.y, bottomPos.z);
    rotateX(flip);
    rotateY(rotationAngle);
    model(bottom);
    pop();
  }
}

function setTarget(state) {
  let active = zeroTarget;
  if (state == 1) {
    active = nineTarget;
  } else if (state == 2) {
    active = eightTarget;
  } else if (state == 3) {
    active = sevenTarget;
  } else if (state == 4) {
    active = sixTarget;
  } else if (state == 5) {
    active = fiveTarget;
  } else if (state == 6) {
    active = fourTarget;
  } else if (state == 7) {
    active = threeTarget;
  } else if (state == 8) {
    active = twoTarget;
  } else if (state == 9) {
    active = oneTarget;
  }

  active.top = { x: 0, y: 0, z: 0 };
  active.middle = active.middle ? { x: 0, y: 0, z: 0 } : null;
  active.middle2 = active.middle2 ? { x: 0, y: 0, z: 0 } : null;
  active.bottom = { x: 0, y: 0, z: 0 };
}

function inactivateTarget(...inactiveTargets) {
  inactiveTargets.forEach((target) => {
    target.top = { x: -20, y: 0, z: 0 };
    target.middle = target.middle ? { x: 20, y: 0, z: 0 } : null;
    target.middle2 = target.middle2 ? { x: 20, y: 0, z: 0 } : null;
    target.bottom = { x: 5, y: -15, z: 0 };
  });
}


function interpolatePosition(current, target) {
  if (!target) return current;
  return {
    x: lerp(current.x, target.x, transitionSpeed),
    y: lerp(current.y, target.y, transitionSpeed),
    z: lerp(current.z, target.z, transitionSpeed),
  };
}

