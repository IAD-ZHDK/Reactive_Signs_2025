function getScriptBasePath() {
  const scripts = document.getElementsByTagName('script');
  const thisScript = scripts[scripts.length - 1];
  const src = thisScript.src;
  return src.substring(0, src.lastIndexOf('/') + 1);
}


// Shared resource loader for Team1
window.Team1Resources = window.Team1Resources || {
  loaded: false,
  models: {},
  font: null,
  preload: function(p) {

    const BASE_PATH = window.basePath;
    // Use absolute paths from the public root
    console.log("preload team1 resources")
    this.models.zeroTop = p.loadModel(`${BASE_PATH}/objects/0Top.obj`);
    this.models.zeroMiddle = p.loadModel(`${BASE_PATH}/objects/0Middle.obj`);
    this.models.zeroBottom = p.loadModel(`${BASE_PATH}/objects/0Bottom.obj`);
    this.models.nineTop = p.loadModel(`${BASE_PATH}/objects/9Top.obj`);
    this.models.nineMiddle = p.loadModel(`${BASE_PATH}/objects/9Middle1.obj`);
    this.models.nineMiddle2 = p.loadModel(`${BASE_PATH}/objects/9Middle2.obj`);
    this.models.nineBottom = p.loadModel(`${BASE_PATH}/objects/9Bottom.obj`);
    this.models.eightTop = p.loadModel(`${BASE_PATH}/objects/8Top.obj`);
    this.models.eightMiddle = p.loadModel(`${BASE_PATH}/objects/8Middle.obj`);
    this.models.eightBottom = p.loadModel(`${BASE_PATH}/objects/8Bottom.obj`);
    this.models.sevenTop = p.loadModel(`${BASE_PATH}/objects/7Top.obj`);
    this.models.sevenMiddle = p.loadModel(`${BASE_PATH}/objects/7Middle.obj`);
    this.models.sevenBottom = p.loadModel(`${BASE_PATH}/objects/7Bottom.obj`);
    this.models.sixTop = p.loadModel(`${BASE_PATH}/objects/6Top.obj`);
    this.models.sixMiddle = p.loadModel(`${BASE_PATH}/objects/6Middle1.obj`);
    this.models.sixMiddle2 = p.loadModel(`${BASE_PATH}/objects/6Middle2.obj`);
    this.models.sixBottom = p.loadModel(`${BASE_PATH}/objects/6Bottom.obj`);
    this.models.fiveTop = p.loadModel(`${BASE_PATH}/objects/5Top.obj`);
    this.models.fiveMiddle = p.loadModel(`${BASE_PATH}/objects/5Middle.obj`);
    this.models.fiveBottom = p.loadModel(`${BASE_PATH}/objects/5Bottom.obj`);
    this.models.fourTop = p.loadModel(`${BASE_PATH}/objects/4Top.obj`);
    this.models.fourBottom = p.loadModel(`${BASE_PATH}/objects/4Bottom.obj`);
    this.models.threeTop = p.loadModel(`${BASE_PATH}/objects/3top.obj`);
    this.models.threeMiddle = p.loadModel(`${BASE_PATH}/objects/3middle.obj`);
    this.models.threeBottom = p.loadModel(`${BASE_PATH}/objects/3bottom.obj`);
    this.models.twoTop = p.loadModel(`${BASE_PATH}/objects/2Top.obj`);
    this.models.twoMiddle = p.loadModel(`${BASE_PATH}/objects/2Middle.obj`);
    this.models.twoBottom = p.loadModel(`${BASE_PATH}/objects/2Bottom.obj`);
    this.models.oneTop = p.loadModel(`${BASE_PATH}/objects/1Top.obj`);
    this.models.oneBottom = p.loadModel(`${BASE_PATH}/objects/1Bottom.obj`);
    this.font = p.loadFont(`${BASE_PATH}/barlow_condensed.otf`);
  }
};

// p5.js instance mode
window.sketch = function(p) {
  const Resources = window.Team1Resources;

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

  p.preload = function() {
    if (!Resources.loaded) {
      Resources.preload(p);
      Resources.loaded = true;
    }
  }

  p.setup = function() {
    p.createCanvas(100, 100, p.WEBGL); // Don't remove this line. 
    p.textFont(Resources.font);
  }

  p.draw = function() {
    p.background(0);
    p.fill(255)
    p.noStroke()
    p.ambientLight(255);
    p.ambientMaterial(255, 255, 255);

    state = p.poster ? p.poster.getCounter() : 0;

    let isoX = 300;
    let isoY = 0;
    let isoZ = 300;
    p.camera(isoX, isoY, isoZ, 0, 0, 0, 0, 1, 0);

    inactivateTarget(zeroTarget, nineTarget, eightTarget, sevenTarget, sixTarget, fiveTarget, fourTarget, threeTarget, twoTarget, oneTarget)

    setTarget(state);

    lastShiftTime = p.millis();

    if (p.poster && p.poster.position.x !== lastMouseX) {
      let normalizedPosterX = p.map(p.poster.position.x, -p.width / 2, p.width / 2, -1, 1); // Map poster.position.x to a range of -1 to 1
      rotationAngle = -normalizedPosterX * p.PI; // Rotate to face left or right depending on position
      lastMouseX = p.poster.position.x;
    }

    interpolateAll();

    let flipAngle = p.PI;
    p.scale(p.poster ? p.poster.vw*9 : 1);

    if (state == 0) {
      renderModel(Resources.models.zeroTop, Resources.models.zeroMiddle, Resources.models.zeroBottom, zeroTopPosition, zeroMiddlePosition, zeroBottomPosition, flipAngle);
    } else if (state == 1) {
      renderModel(Resources.models.nineTop, Resources.models.nineMiddle, Resources.models.nineBottom, nineTopPosition, nineMiddlePosition, nineBottomPosition, flipAngle, Resources.models.nineMiddle2, nineMiddle2Position);
    } else if (state == 2) {
      renderModel(Resources.models.eightTop, Resources.models.eightMiddle, Resources.models.eightBottom, eightTopPosition, eightMiddlePosition, eightBottomPosition, flipAngle);
    } else if (state == 3) {
      renderModel(Resources.models.sevenTop, Resources.models.sevenMiddle, Resources.models.sevenBottom, sevenTopPosition, sevenMiddlePosition, sevenBottomPosition, flipAngle);
    } else if (state == 4) {
      renderModel(Resources.models.sixTop, Resources.models.sixMiddle, Resources.models.sixBottom, sixTopPosition, sixMiddlePosition, sixBottomPosition, flipAngle, Resources.models.sixMiddle2, sixMiddle2Position);
    } else if (state == 5) {
      renderModel(Resources.models.fiveTop, Resources.models.fiveMiddle, Resources.models.fiveBottom, fiveTopPosition, fiveMiddlePosition, fiveBottomPosition, flipAngle);
    } else if (state == 6) {
      renderModel(Resources.models.fourTop, null, Resources.models.fourBottom, fourTopPosition, null, fourBottomPosition, flipAngle);
    } else if (state == 7) {
      renderModel(Resources.models.threeTop, Resources.models.threeMiddle, Resources.models.threeBottom, threeTopPosition, threeMiddlePosition, threeBottomPosition, flipAngle);
    } else if (state == 8) {
      renderModel(Resources.models.twoTop, Resources.models.twoMiddle, Resources.models.twoBottom, twoTopPosition, twoMiddlePosition, twoBottomPosition, flipAngle);
    } else if (state == 9) {
      renderModel(Resources.models.oneTop, null, Resources.models.oneBottom, oneTopPosition, null, oneBottomPosition, flipAngle);
    }
  }

  function interpolateAll(){
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
      p.push();
      p.translate(topPos.x, topPos.y, topPos.z);
      p.rotateX(flip);
      p.rotateY(rotationAngle);
      p.model(top);
      p.pop();
    }
    if (middle) {
      p.push();
      p.translate(middlePos.x, middlePos.y, middlePos.z);
      p.rotateX(flip);
      p.rotateY(rotationAngle);
      p.model(middle);
      p.pop();
    }
    if (middle2) {
      p.push();
      p.translate(middle2Pos.x, middle2Pos.y, middle2Pos.z);
      p.rotateX(flip);
      p.rotateY(rotationAngle);
      p.model(middle2);
      p.pop();
    }
    if (bottom) {
      p.push();
      p.translate(bottomPos.x, bottomPos.y, bottomPos.z);
      p.rotateX(flip);
      p.rotateY(rotationAngle);
      p.model(bottom);
      p.pop();
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
      x: p.lerp(current.x, target.x, transitionSpeed),
      y: p.lerp(current.y, target.y, transitionSpeed),
      z: p.lerp(current.z, target.z, transitionSpeed),
    };
  }
};
