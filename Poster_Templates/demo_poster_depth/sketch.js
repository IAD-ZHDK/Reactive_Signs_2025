
// depthData : represents an array of depth data. Only available with setupOSC(true)
// depthW: The horizontal resolution of the data array
// depthH: The vertical resolution of the data array
let images = [];

function preload() {
  let imagCount = 9;
  for(let i=0;i<imagCount;i++) {
    images[i] = loadImage('images/'+imagCount+'.png'); // load up all images 
    images[i].loadPixels();
  }
}

function setup() {
  createCanvas(100,100); // poster is resized automatically

}

function draw() {
  background(0);
  lineEffect()
  //pixelEffect()
}

function lineEffect() {
  push();
  
  let spaceX = width/poster.depthW;
  let spaceY = height/poster.depthH;
  spaceX += poster.vw*0.1;
  spaceY += poster.vh*0.1;
  stroke(255);
	strokeWeight(2);
  noFill();
	// loop through all the pixels in the depth image
  translate(-poster.vw*3,0)
  for (let y = 0; y<poster.depthH; y+=2) {
		beginShape();
		for (let x = 0; x < poster.depthW; x+=3) {
      let index = (y*poster.depthW)+x;
			let h = poster.depthData[index]*poster.vh*0.05; 
			curveVertex(x*spaceX, (y*spaceY)-h);
		}
		endShape();
	}
  pop();
/*
let spaceX = width/images[0].width;
let spaceY = height/images[0].height;
spaceX += poster.vw*0.1;
spaceY += poster.vh*0.1;
stroke(255);
strokeWeight(2);
noFill();
// loop through all the pixels in number image
translate(-poster.vw*3,0)
for (let y = 0; y<images[0].height; y++) {
  beginShape();
  for (let x = 0; x < images[0].width; x++) {
    let index = (y*images[0].width)+x;
    let h = images[0].pixels[index];
    curveVertex(x*spaceX, (y*spaceY));
  }
  endShape();
}
pop();
  image(images[0],0,0); // uncomment to see how the buffer actually looks 
*/
}





