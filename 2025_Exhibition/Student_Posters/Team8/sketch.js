let zeroInflated, zeroDeflated;
let oneInflated, oneDeflated;
let twoInflated, twoDeflated;
let threeInflated, threeDeflated;
let fourInflated, fourDeflated;
let fiveInflated, fiveDeflated;
let sixInflated, sixDeflated;
let sevenInflated, sevenDeflated;
let eightInflated, eightDeflated;
let nineInflated, nineDeflated;

let morphAmount = 0;
let morphOffset = 0;
let lastNumber = 99;
let cachedVertices = null; // Float32Array (vlen * 3)
let cachedNormals = null;  // Float32Array (vlen * 3)
let cachedUVs = null;      // Float32Array (vlen * 2)
let lastMorphAmount = -1;
let lastModelSet = null;

let environmentTexture;

let lastSwitchTime = 0;

let currentModelSet;
let font;
const TAU = Math.PI * 2;

// ---------- wiggle params ----------
const WIGGLE_AMP = 0.02; // max amplitude of vertex wobble (adapt to your model scale)
const WIGGLE_SPEED = 0.0015; // temporal speed (ms based)
const WIGGLE_FREQ = 0.6; // spatial frequency (how different adjacent vertices are)
// ----------------------------------


let pg;

function smoothstep(edge0, edge1, x) {
  const t = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function preload() {
  zeroInflated = loadModel("obj0morphing/0inflated.obj");
  zeroDeflated = loadModel("obj0morphing/0.obj");
  oneInflated = loadModel("obj1morphing/1Inflate.obj");
  oneDeflated = loadModel("obj1morphing/1.obj");
  twoInflated = loadModel("obj2morphing/balloon2.obj");
  twoDeflated = loadModel("obj2morphing/2deflated.obj");
  threeInflated = loadModel("obj3morphing/3inflated.obj");
  threeDeflated = loadModel("obj3morphing/3.obj");
  fourInflated = loadModel("obj4morphing/4inflated.obj");
  fourDeflated = loadModel("obj4morphing/4.obj");
  fiveInflated = loadModel("obj5morphing/5inflated.obj");
  fiveDeflated = loadModel("obj5morphing/5.obj");
  sixInflated = loadModel("obj6morphing/6inflated.obj");
  sixDeflated = loadModel("obj6morphing/6.obj");
  sevenInflated = loadModel("obj7morphing/7inflated.obj");
  sevenDeflated = loadModel("obj7morphing/7.obj");
  eightInflated = loadModel("obj8morphing/8inflated.obj");
  eightDeflated = loadModel("obj8morphing/8.obj");
  nineInflated = loadModel("obj9morphing/9inflated.obj");
  nineDeflated = loadModel("obj9morphing/9.obj");

  font = loadFont('barlow_condensed.otf');

  //environmentTexture = loadImage("jpgenvironment/1000_F_550636640_B92xt7SrhkGpZtVua48Vi6gaSMA4oNYA.jpg");
  //environmentTexture2 = loadImage("jpgenvironment/studio_small_08_4k2.jpg");
  // environmentTexture3 = loadImage("jpgenvironment/studio.png");
  // environmentTexture4 = loadImage("jpgenvironment/studio2.png");
  // environmentTexture5 = loadImage("jpgenvironment/fancy.jpg");
  // environmentTexture6 = loadImage("jpgenvironment/fancy2.png");
  // environmentTexture7 = loadImage("jpgenvironment/crazy.jpg");
  environmentTexture = loadImage("jpgenvironment/chrome1.jpg");
  //environmentTexture9 = loadImage("jpgenvironment/chrome2.jpg");
}
function setup() {
  /*important!*/ createCanvas(100, 100, WEBGL); // Don't remove this line.
  noStroke();
  textFont(font)
  // Create a p5.Graphics object.
  pg = createGraphics(100, 100);

  // Draw a circle to the p5.Graphics object.
  pg.background(0, 0, 0);
  texture(pg);
}
function drawTest() {
  push()
  imageLight(environmentTexture);
  shininess(300);
  metalness(100);
  background(100);
  scale(6.5 * poster.vh);
  rotateX(HALF_PI);
  rotateY(PI);
  rotateZ(PI + sin(millis() * 0.001) * 0.05);
  model(zeroDeflated);

  pop();
}

function draw() {
  background(0);


  if (millis() - lastSwitchTime > 1000) {
    morphOffset += 0.25 / width;
    morphOffset = constrain(morphOffset, 0, 1);
    lastSwitchTime = millis();
  }

  morphAmount = map(poster.position.x, 0, width, 0, 1) + morphOffset;
  morphAmount = constrain(morphAmount, 0, 1);

  // Add subtle breathing morph when near deflated
  if (morphAmount < 0.1) {
    // const oscillation = sin(millis() * 0.002) * 0.03 + 0.5;
    // morphAmount = constrain(morphAmount + oscillation, 0, 1);
  }

  imageLight(environmentTexture);
  shininess(300);
  metalness(100);

  push();
  rotateX(HALF_PI);
  rotateY(PI);
  rotateZ(PI + sin(millis() * 0.001) * 0.05);
  scale(6.5 * poster.vh);

  currentModelSet = poster.getCounter();
  switch (currentModelSet) {
    case 0:
      renderMorphedModel(zeroDeflated, zeroInflated, morphAmount, currentModelSet);
      break;
    case 1:
      renderMorphedModel(oneDeflated, oneInflated, morphAmount, currentModelSet);
      break;
    case 2:
      renderMorphedModel(twoDeflated, twoInflated, morphAmount, currentModelSet);
      break;
    case 3:
      renderMorphedModel(threeDeflated, threeInflated, morphAmount, currentModelSet);
      break;
    case 4:
      renderMorphedModel(fourDeflated, fourInflated, morphAmount, currentModelSet);
      break;
    case 5:
      renderMorphedModel(fiveDeflated, fiveInflated, morphAmount, currentModelSet);
      break;
    case 6:
      renderMorphedModel(sixDeflated, sixInflated, morphAmount, currentModelSet);
      break;
    case 7:
      renderMorphedModel(sevenDeflated, sevenInflated, morphAmount, currentModelSet);
      break;
    case 8:
      renderMorphedModel(eightDeflated, eightInflated, morphAmount, currentModelSet);
      break;
    case 9:
      renderMorphedModel(nineDeflated, nineInflated, morphAmount, currentModelSet);
      break;
    default:
      console.error("Unbekanntes Modell-Set:", currentModelSet);
  }

  pop();
}

function renderMorphedModel(modelA, modelB, morphAmount, modelSet) {
  if (
    !modelA ||
    !modelB ||
    !modelA.vertices ||
    !modelB.vertices ||
    !modelA.faces
  ) {
    console.error("Models not ready.");
    return;
  }

  const verticesA = modelA.vertices;
  const verticesB = modelB.vertices;
  const normalsA = modelA.vertexNormals || [];
  const normalsB = modelB.vertexNormals || [];
  const uvsA = modelA.uvs || [];
  const uvsB = modelB.uvs || [];
  const faces = modelA.faces;

  const sameCount = verticesA.length === verticesB.length;
  const hasUVs =
    uvsA.length === verticesA.length && uvsB.length === verticesB.length;

  if (!sameCount) {
    console.error("Vertex count mismatch.");
    return;
  }

  // Recompute cache only when morphAmount changes
  if (morphAmount !== lastMorphAmount || modelSet !== lastModelSet) {
    lastModelSet = modelSet;

    const vlen = verticesA.length;
    cachedVertices = new Float32Array(vlen * 3);
    cachedNormals = new Float32Array(vlen * 3);
    cachedUVs = new Float32Array(vlen * 2);

    for (let i = 0; i < vlen; i++) {
      const vA = verticesA[i];
      const vB = verticesB[i];

      const vx = lerp(vA.x, vB.x, morphAmount);
      const vy = lerp(vA.y, vB.y, morphAmount);
      const vz = lerp(vA.z, vB.z, morphAmount);
      const b3 = i * 3;
      cachedVertices[b3] = vx;
      cachedVertices[b3 + 1] = vy;
      cachedVertices[b3 + 2] = vz;

      if (normalsA[i] && normalsB[i]) {
        let nx = lerp(normalsA[i].x, normalsB[i].x, morphAmount);
        let ny = lerp(normalsA[i].y, normalsB[i].y, morphAmount);
        let nz = lerp(normalsA[i].z, normalsB[i].z, morphAmount);
        const invLen = 1 / Math.hypot(nx, ny, nz);
        cachedNormals[b3] = nx * invLen;
        cachedNormals[b3 + 1] = ny * invLen;
        cachedNormals[b3 + 2] = nz * invLen;
      } else {
        const invLen = 1 / Math.max(Math.hypot(vx, vy, vz), 1e-6);
        cachedNormals[b3] = vx * invLen;
        cachedNormals[b3 + 1] = vy * invLen;
        cachedNormals[b3 + 2] = vz * invLen;
      }

      const b2 = i * 2;
      if (hasUVs) {
        const uA = uvsA[i];
        const uB = uvsB[i];
        cachedUVs[b2] = lerp(uA.x, uB.x, morphAmount);
        cachedUVs[b2 + 1] = lerp(uA.y, uB.y, morphAmount);
      } else {
        const uv = sphericalUV(vx, vy, vz);
        cachedUVs[b2] = uv[0];
        cachedUVs[b2 + 1] = uv[1];
      }
    }

    lastMorphAmount = morphAmount;
  }

  // Wiggle only when close to deflated
  const t = millis() * WIGGLE_SPEED;
  //const deflatedWeight = 1.0 - smoothstep(0.0, 0.25, morphAmount); // 1 at morph≈0, fades to 0 by 0.25

  beginShape(TRIANGLES);
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    if (!face || face.length < 3) continue;

    for (let j = 0; j < 3; j++) {
      const idx = face[j];
      const b3 = idx * 3;
      const b2 = idx * 2;

      const vx = cachedVertices[b3];
      const vy = cachedVertices[b3 + 1];
      const vz = cachedVertices[b3 + 2];
      const nx = cachedNormals[b3];
      const ny = cachedNormals[b3 + 1];
      const nz = cachedNormals[b3 + 2];
      const u = cachedUVs[b2];
      const vv = cachedUVs[b2 + 1];

      if (vx === undefined) continue;
      /*
            if (deflatedWeight > 0) {
              // noise returns [0..1], map to [-1..1]
               const disp = (noise(idx * WIGGLE_FREQ, t) * 2.0 - 1.0) * WIGGLE_AMP * deflatedWeight;
              vx += n.x * disp;
              vy += n.y * disp;
              vz += n.z * disp;
            }
      */
      normal(nx, ny, nz);
      vertex(vx, vy, vz, u, vv);
    }
  }
  endShape();
}

function sphericalUV(x, y, z) {
  const len = Math.hypot(x, y, z) || 1.0;
  const nx = x / len;
  const ny = y / len;
  const nz = z / len;

  const phi = Math.atan2(nz, nx);
  const theta = Math.asin(Math.min(Math.max(ny, -1.0), 1.0));

  const u = 0.5 + phi / TAU;
  const v = 0.5 - theta / Math.PI;
  return [u, v];
}

/**
 * Adjusts the rendering properties when the window is scaled.
 */
function windowScaled() {
  if (_renderer.drawingContext instanceof WebGLRenderingContext) {
  }
}
