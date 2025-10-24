window.Team3Resources = window.Team3Resources || {
  loaded: false,
  models: {},
  digits: [],
  reflectionImg: null,
  reflectionImg2: null,
  font: null,
  preload: function (p) {
    console.log("loading assets...");
    const BASE_PATH = window.basePath;
    this.font = p.loadFont(`${BASE_PATH}barlow_condensed.otf`);
    this.reflectionImg = p.loadImage(`${BASE_PATH}/assets/scape.jpg`);
    this.reflectionImg2 = p.loadImage(`${BASE_PATH}/assets/texture.gif`);
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
    //console.log(cam);
    // display one to load into memory buffer
    for (let i = 0; i < 10; i++) {
      //  p.model(Resources.digits[i]);
    }
  };

  p.draw = function () {
    p.background(0);
    drawNum(Resources.digits[p.poster.getCounter()]);
  };

  function drawNum(objModel) {
    p.push();
    // texture & styling
    p.shininess(200);
    p.specularMaterial(50);
    p.metalness(100);
    p.imageLight(Resources.reflectionImg);
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
    for (let i = 0; i < geometry.vertices.length; i += 1500) {
      // Vertex
      let v = geometry.vertices[i];

      // Calculate the direction of the vertex from the center
      let direction = p.createVector(v.x, v.y, v.z).normalize();

      // Cone Size

      let coneLength = p.map(p.abs(p.poster.posNormal.x - 0.5), 0, 0.5, 0, 10);
      let coneRadius = 0.25;  // Radius of the cone base

      p.push();

      // Position the cone at the vertex
      p.translate(v.x, v.y, v.z);

      // Align the cone to the direction vector
      let rotationAxis = p.createVector(0, 1, 0).cross(direction).normalize();
      let angle = p.acos(p.createVector(0, 1, 0).dot(direction));

      // Ensure consistent rotation even for edge cases (ChatGPT)
      if (rotationAxis.mag() > 0) {
        p.rotate(angle, rotationAxis);
      }

      // Offset the cone so its base is flush with the vertex (ChatGPT)
      p.translate(0, coneLength / 2, 0);

      // Draw the cone
      p.noStroke();
      p.cone(coneRadius, coneLength);
      p.pop();
    }
  }

};
