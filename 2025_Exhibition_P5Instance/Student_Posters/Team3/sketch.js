window.Team3Resources = window.Team3Resources || {
  loaded: false,
  models: {},
  digits: [],
  reflectionImg: null,
  font: null,
  preload: function (p) {
    console.log("loading assets...");
    const BASE_PATH = window.basePath;
    this.font = p.loadFont(`${BASE_PATH}/Montserrat-Black.ttf`);
    this.reflectionImg = p.loadImage(`${BASE_PATH}/assets/scape.jpg`);
    // make copy of reflectionImg for second texture

    // this.reflectionImg2 = p.loadImage(`${BASE_PATH}/assets/texture.gif`);
    for (let i = 0; i < 10; i++) {
      this.digits[i] = p.loadModel(`${BASE_PATH}/assets/${i}.obj`);
    }
  }
}


window.sketch = function (p) {
  const Resources = window.Team3Resources;
  p.preload = function () {
    if (!Resources.loaded) {
      Resources.preload(p);
      Resources.loaded = true;
    }
  }



  p.setup = function () {
    p.createCanvas(100, 100, p.WEBGL); // Don't remove this line.
    p.textFont(Resources.font);
    p.noStroke();
    let cam = p.createCamera();
    // Preload geometry
    for (let i = 0; i < 10; i++) {
      p.model(Resources.digits[i]);
    }
    /*
        let iw = 255,
        let ih = 255;
        Resources.reflectionImg.loadPixels();
        for (let x = 0; x < iw; x++) {
          for (let y = 0; y < iw; y++) {
            Resources.reflectionImg.set(x, y, [255, 255, 0, 255 - x]);
            Resources.reflectionImg.updatePixels();
          }
        }
    */
    // Warmup: compile shaders by rendering with all materials once
    p.push();
    p.shininess(200);
    p.specularMaterial(50);
    p.metalness(100);
    p.imageLight(Resources.reflectionImg);
    p.box(1); // dummy geometry to compile shaders
    p.pop();
  };

  p.draw = function () {
    p.background(255, 0, 0);
    p.imageLight(Resources.reflectionImg);
    // Warm up imageLight on first frame only
    drawNum(Resources.digits[p.poster.counter]);
  };

  function drawNum(objModel) {
    p.push();
    // texture & styling
    p.shininess(200);
    p.specularMaterial(50);
    p.metalness(100);
    // flip model upside down
    p.rotateX(p.PI);
    // increase size if user is on either side
    let distanceFromCenter = Math.abs(p.poster.posNormal.x - 0.5);
    let scaleFactor = 15 + distanceFromCenter * 20;
    p.scale(scaleFactor);
    // rotate model to face viewer
    let targetAngle = p.map(p.poster.posNormal.x, 0, 1, p.PI / 4, -p.PI / 4);
    p.rotateY(targetAngle);
    let angle = p.map(Math.sin(p.frameCount * 0.05), -1, 1, -p.PI / 16, p.PI / 16);
    p.rotateX(angle);
    p.push();
    // display model
    p.model(objModel);
    updateGeometry(objModel);
    p.pop();
    p.pop();
  }

  function updateGeometry(geometry) {
    const step = 3000; // Render fewer cones (increase step size)
    for (let i = 0; i < geometry.vertices.length; i += step) {
      let v = geometry.vertices[i];
      let direction = p.createVector(v.x, v.y, v.z).normalize();
      let coneLength = p.map(p.abs(p.poster.posNormal.x - 0.5), 0, 0.5, 0, 10);
      let coneRadius = 0.25;

      p.push();
      p.translate(v.x, v.y, v.z);
      let rotationAxis = p.createVector(0, 1, 0).cross(direction).normalize();
      let angle = p.acos(p.createVector(0, 1, 0).dot(direction));
      if (rotationAxis.mag() > 0) {
        p.rotate(angle, rotationAxis);
      }
      p.translate(0, coneLength / 2, 0);
      p.noStroke();
      p.cone(coneRadius, coneLength);
      p.pop();
    }
  }

};
