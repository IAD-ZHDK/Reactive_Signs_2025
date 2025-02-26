let digits = [];
let font, reflectionImg, spikeObj;

function preload() {
    font = loadFont('barlow_condensed.otf');
    reflectionImg = loadImage('./assets/scape.jpg')
    reflectionImg2 = loadImage('./assets/texture.gif')

    for (let i = 0; i < 10; i++) {
        digits[i] = loadModel(`./assets/${i}.obj`);
    }
}

function setup() {
  /*important!*/ createCanvas(100,100, WEBGL); // Don't remove this line. 

    textFont(font)
    noStroke();
    let cam = createCamera();
    console.log(cam)
    // display one to load into memory buffer
    for (let i = 0; i < 10; i++) {
        model(digits[i]);
      }
}

function draw() {
    background(0)
    drawNum(digits[poster.getCounter()]);
}

function drawNum(objModel) {

    push()

    // texture & styling
    shininess(200);
    specularMaterial(50);
    metalness(100);
    imageLight(reflectionImg);


    // flip model upside down
    rotateX(PI)

    // increase size if user is on either side
    let distanceFromCenter = abs(poster.posNormal.x - 0.5);
    let scaleFactor = 15 + distanceFromCenter * 20;
    scale(scaleFactor);

    // rotate model to face viewer
    let targetAngle = map(poster.posNormal.x, 0, 1, PI / 4, -PI / 4);
    rotateY(targetAngle);

    let angle = map(sin(frameCount * 0.05), -1, 1, -PI / 16, PI / 16);
    rotateX(angle);

    push()
    // display model
    model(objModel);
    updateGeometry(objModel);
    pop()

    pop()


}

function updateGeometry(geometry) {
    for (let i = 0; i < geometry.vertices.length; i += 1500) {

        // Vertex
        let v = geometry.vertices[i];

        // Calculate the direction of the vertex from the center
        let direction = createVector(v.x, v.y, v.z).normalize();

        // Cone Size

        let coneLength = map(abs(poster.posNormal.x - 0.5), 0, 0.5, 0, 10);
        let coneRadius = 0.25;  // Radius of the cone base

        push();

        // Position the cone at the vertex
        translate(v.x, v.y, v.z);

        // Align the cone to the direction vector
        let rotationAxis = createVector(0, 1, 0).cross(direction).normalize();
        let angle = acos(createVector(0, 1, 0).dot(direction));

        // Ensure consistent rotation even for edge cases (ChatGPT)
        if (rotationAxis.mag() > 0) {
            rotate(angle, rotationAxis);
        }

        // Offset the cone so its base is flush with the vertex (ChatGPT)
        translate(0, coneLength / 2, 0);

        // Draw the cone
        noStroke();
        cone(coneRadius, coneLength);
        pop();
    }
}
