/*
      _____                    _____                    _____                    _____          
     /\    \                  /\    \                  /\    \                  /\    \         
    /::\    \                /::\    \                /::\    \                /::\____\        
    \:::\    \              /::::\    \              /::::\    \              /::::|   |        
     \:::\    \            /::::::\    \            /::::::\    \            /:::::|   |        
      \:::\    \          /:::/\:::\    \          /:::/\:::\    \          /::::::|   |        
       \:::\    \        /:::/__\:::\    \        /:::/__\:::\    \        /:::/|::|   |        
       /::::\    \      /::::\   \:::\    \      /::::\   \:::\    \      /:::/ |::|   |        
      /::::::\    \    /::::::\   \:::\    \    /::::::\   \:::\    \    /:::/  |::|___|______  
     /:::/\:::\    \  /:::/\:::\   \:::\    \  /:::/\:::\   \:::\    \  /:::/   |::::::::\    \ 
    /:::/  \:::\____\/:::/__\:::\   \:::\____\/:::/  \:::\   \:::\____\/:::/    |:::::::::\____\
   /:::/    \::/    /\:::\   \:::\   \::/    /\::/    \:::\  /:::/    /\::/    / ~~~~~/:::/    /
  /:::/    / \/____/  \:::\   \:::\   \/____/  \/____/ \:::\/:::/    /  \/____/      /:::/    / 
 /:::/    /            \:::\   \:::\    \               \::::::/    /               /:::/    /  
/:::/    /              \:::\   \:::\____\               \::::/    /               /:::/    /   
\::/    /                \:::\   \::/    /               /:::/    /               /:::/    /    
 \/____/                  \:::\   \/____/               /:::/    /               /:::/    /     
                           \:::\    \                  /:::/    /               /:::/    /      
                            \:::\____\                /:::/    /               /:::/    /       
                             \::/    /                \::/    /                \::/    /        
                              \/____/                  \/____/                  \/____/         
                                                                                                

         _______                   _____                    _____          
        /::\    \                 /\    \                  /\    \         
       /::::\    \               /::\____\                /::\    \        
      /::::::\    \             /::::|   |               /::::\    \       
     /::::::::\    \           /:::::|   |              /::::::\    \      
    /:::/~~\:::\    \         /::::::|   |             /:::/\:::\    \     
   /:::/    \:::\    \       /:::/|::|   |            /:::/__\:::\    \    
  /:::/    / \:::\    \     /:::/ |::|   |           /::::\   \:::\    \   
 /:::/____/   \:::\____\   /:::/  |::|   | _____    /::::::\   \:::\    \  
|:::|    |     |:::|    | /:::/   |::|   |/\    \  /:::/\:::\   \:::\    \ 
|:::|____|     |:::|    |/:: /    |::|   /::\____\/:::/__\:::\   \:::\____\
 \:::\    \   /:::/    / \::/    /|::|  /:::/    /\:::\   \:::\   \::/    /
  \:::\    \ /:::/    /   \/____/ |::| /:::/    /  \:::\   \:::\   \/____/ 
   \:::\    /:::/    /            |::|/:::/    /    \:::\   \:::\    \     
    \:::\__/:::/    /             |::::::/    /      \:::\   \:::\____\    
     \::::::::/    /              |:::::/    /        \:::\   \::/    /    
      \::::::/    /               |::::/    /          \:::\   \/____/     
       \::::/    /                /:::/    /            \:::\    \         
        \::/____/                /:::/    /              \:::\____\        
         ~~                      \::/    /                \::/    /        
                                  \/____/                  \/____/      */

let depth = 32;
let cols = 18;
let speed = 0.3;
let t = 0;

let numberZ = 0;
let numberSpeed = 0.2;

let tunnelFillLayer;
let tunnelStrokeLayer;
let maskLayer;
let finalLayer;

let customFont;

let lastMove = 0;
let idleDelay = 3000;
let idle = true;
let smoothedShift = 0;
let prevPosX = 0;

function preload() {
  customFont = loadFont("Uneko.otf");
}

function setup() {
  createCanvas(100, 100);
  noStroke();

  tunnelFillLayer = createGraphics(width, height);
  tunnelStrokeLayer = createGraphics(width, height);
  maskLayer = createGraphics(width, height);
  finalLayer = createGraphics(width, height);

  maskLayer.textAlign(CENTER, CENTER);
  maskLayer.textFont(customFont);

  prevPosX = poster.position.x;
}

function windowResized() {
  tunnelFillLayer = createGraphics(width, height);
  tunnelStrokeLayer = createGraphics(width, height);
  maskLayer = createGraphics(width, height);
  finalLayer = createGraphics(width, height);

  maskLayer.textAlign(CENTER, CENTER);
  maskLayer.textFont(customFont);
}

function smoothstep(x) {
  return x * x * (3 - 2 * x);
}

function draw() {
  background(0);

  let currentNumber = poster.getCounter();
  let now = millis();

  let currentPosX = poster.position.x;
  let movedX = abs(currentPosX - prevPosX);

  if (movedX > 5) {
    idle = false;
    lastMove = now;
  }

  if (now - lastMove > idleDelay) {
    idle = true;
  }

  prevPosX = currentPosX;
  numberZ += numberSpeed;

  if (numberZ > depth) {
    numberZ = 0;
  }

  let scroll = (t += speed) * 0.01;
  let targetShift = idle ? 0 : map(currentPosX, 0, width, -1, 1);
  let lerpAmt = idle ? 0.03 : 0.25;

  smoothedShift = lerp(smoothedShift, targetShift, lerpAmt);
  let cx = width / 2 - smoothedShift * (poster.vw * 40);
  let cy = height / 2;

  // Reset layers and paint settings
  tunnelFillLayer.clear();
  tunnelStrokeLayer.clear();
  maskLayer.clear();
  finalLayer.clear();

  tunnelStrokeLayer.noFill();
  tunnelStrokeLayer.stroke(255);
  tunnelStrokeLayer.strokeWeight(1.2);
  tunnelFillLayer.noStroke();

  // Tunnel
  for (let d = 0; d < depth; d++) {
    let td1 = smoothstep(d / depth);
    let td2 = smoothstep((d + 1) / depth);

    let L1 = lerp(0, cx, td1);
    let R1 = lerp(width, cx, td1);
    let T1 = lerp(0, cy, td1);
    let B1 = lerp(height, cy, td1);

    let L2 = lerp(0, cx, td2);
    let R2 = lerp(width, cx, td2);
    let T2 = lerp(0, cy, td2);
    let B2 = lerp(height, cy, td2);

    for (let j = 0; j < cols; j++) {
      let a = j / cols;
      let b = (j + 1) / cols;

      let x1A = lerp(L1, R1, a);
      let x1B = lerp(L1, R1, b);
      let x2A = lerp(L2, R2, a);
      let x2B = lerp(L2, R2, b);

      let checker = floor((d + scroll) * 0.5 + j) % 2;

      tunnelFillLayer.fill(checker < 1 ? 0 : 255);
      tunnelFillLayer.quad(x1A, T1, x1B, T1, x2B, T2, x2A, T2);
      tunnelFillLayer.quad(x1A, B1, x1B, B1, x2B, B2, x2A, B2);
      tunnelFillLayer.quad(
        L1,
        lerp(T1, B1, a),
        L1,
        lerp(T1, B1, b),
        L2,
        lerp(T2, B2, b),
        L2,
        lerp(T2, B2, a)
      );
      tunnelFillLayer.quad(
        R1,
        lerp(T1, B1, a),
        R1,
        lerp(T1, B1, b),
        R2,
        lerp(T2, B2, b),
        R2,
        lerp(T2, B2, a)
      );

      tunnelStrokeLayer.quad(x1A, T1, x1B, T1, x2B, T2, x2A, T2);
      tunnelStrokeLayer.quad(x1A, B1, x1B, B1, x2B, B2, x2A, B2);
      tunnelStrokeLayer.quad(
        L1,
        lerp(T1, B1, a),
        L1,
        lerp(T1, B1, b),
        L2,
        lerp(T2, B2, b),
        L2,
        lerp(T2, B2, a)
      );
      tunnelStrokeLayer.quad(
        R1,
        lerp(T1, B1, a),
        R1,
        lerp(T1, B1, b),
        R2,
        lerp(T2, B2, b),
        R2,
        lerp(T2, B2, a)
      );
    }
  }

  // Number
  let scaleNumber = map(numberZ, 0, depth, 0.05, 3);

  maskLayer.push();
  maskLayer.translate(cx, cy);
  maskLayer.scale(scaleNumber);
  maskLayer.fill(255);
  maskLayer.textAlign(CENTER, CENTER);
  maskLayer.textSize(500);
  maskLayer.text(currentNumber, 0, 0);
  maskLayer.pop();

  finalLayer.drawingContext.globalCompositeOperation = "source-over";
  finalLayer.image(tunnelFillLayer, 0, 0);

  finalLayer.drawingContext.globalCompositeOperation = "destination-in";
  finalLayer.image(maskLayer, 0, 0);

  finalLayer.drawingContext.globalCompositeOperation = "destination-over";
  finalLayer.image(tunnelStrokeLayer, 0, 0);

  image(finalLayer, 0, 0);
}
