let gridCountX = 16;
let gridCountY = 56;
let offset = 3;
let random10 = [];
let nameArray = ['1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4'];

let gridArray = Array(gridCountX).fill().map(() => Array(gridCountY).fill(null));

let triangleList = [] // this stores the actual TesoTriangle objects
let isBlackTriangles = [];
let counter = 0;

let font;
function preload() {
	// load the font
	font = loadFont('barlow_condensed.otf');
}

function setup() {

 /*important!*/ createCanvas(100, 100); // Don't remove this line.
	//createCanvas(1050 / 2, 1920 / 2);
	background(100);
	textFont(font);
	for (let i = 0; i < gridCountX; i++) {
		for (let j = 0; j < gridCountY; j++) {

			gridArray[i][j] = 0;
			triangleList.push(new TesoTriangle(i, j));

		}

	}

}


function draw() {
	push();
	//translate(-width / 2, -height / 2); // WEBGL center correction
	background(255)

	counter++
	if (counter == 10) {
		console.log(nameArray)
	}

	//background(255)
	noStroke(); // IN REALIT
	//stroke(255); // TO HELP

	for (let i = 0; i < triangleList.length; i++) {
		if (!triangleList[i].active) {
			triangleList[i].showTriangle();
		}

	}
	pop();
}

function windowResized() { // this is a custom event called whenever the poster is scaled
	//console.log("triangleList"+triangleList.length)
	for (let i = 0; i < triangleList.length; i++) {
		triangleList[i].updatePositions();
		//console.log("count" + i)
	}
}

class TesoTriangle {

	constructor(i, j, w, h) {

		this.i = i; //row and column
		this.j = j;

		this.w = width / gridCountX; // width and height -> dependant on canvas size
		this.h = height / gridCountY;

		this.x = i * this.w; // top left corner coordinates of triangle
		this.y = j * this.h;

		this.active = false; // boolean to determine color
		this.scale = 0; // Add scale property

		this.phaseOffset = (i + j) * 0.1;
		this.targetScale = 0; // Add target scale property
		this.animationSpeed = 0.1;
		this.isBlack = false;

		this.showLines = random() > 0.7;
	}

	updatePositions() {

		this.w = width / gridCountX; // width and height -> dependant on canvas size
		this.h = height / gridCountY;

		this.x = this.i * this.w; // top left corver coordinates of triangle
		this.y = this.j * this.h;

	}
	// NEW CODE END

	showTriangle() {

		push(); // for every triangle new settingBase

		translate(this.x, this.y)


		//calling the number arrays to color them
		let currentDigits;
		switch (poster.getCounter()) {
			case 9: currentDigits = numberNine; break;
			case 8: currentDigits = numberEight; break;
			case 7: currentDigits = numberSeven; break;
			case 6: currentDigits = numberSix; break;
			case 5: currentDigits = numberFive; break;
			case 4: currentDigits = numberFour; break;
			case 3: currentDigits = numberThree; break;
			case 2: currentDigits = numberTwo; break;
			case 1: currentDigits = numberOne; break;
			case 0: currentDigits = numberZero; break;
		}

		let shouldBeBlack = currentDigits.some(item => item[0] === this.i && item[1] === this.j);


		// Update target scale based on whether triangle should be black
		if (shouldBeBlack) {
			this.targetScale = 1;
			this.isBlack = true;
		} else if (this.isBlack) {
			// If it was black but shouldn't be anymore, animate to disappear
			this.targetScale = 0;
			if (this.scale <= 0.01) {
				this.isBlack = false;
			}
		}

		let time = frameCount * 0.05; // Increased from 0.05 to 0.15 for faster wave
		let wave = sin(time + this.phaseOffset) * 0.1 + 1; // Keeps the subtle wave amplitude


		// Apply wave effect only during transitions
		let targetWithWave = this.targetScale;
		if (this.targetScale > 0) { // when triangle is part of the visible number
			targetWithWave = this.targetScale * wave;
		} else { // when disappearing
			targetWithWave = this.targetScale;
		}

		// Single animation update with different speeds for appear/disappear
		this.scale = lerp(this.scale, targetWithWave, this.targetScale === 0 ? 0.3 : 0.1);

		// Single scaling transformation
		translate(this.w / 2, this.h / 2);
		scale(this.scale);
		translate(-this.w / 2, -this.h / 2);
		// Set fill color
		if (this.isBlack) {
			fill(0);
		} else {
			fill(255);
		}

		let invert = this.i % 2;
		invert -= this.j % 2;

		let slider = map(poster.posNormal.x, 0, 1, -20, 20);

		if (invert) {
			let p1 = createVector(0, this.h / 2);
			let p2 = createVector(this.w, 0 - (this.h / 2));
			let p3 = createVector(this.w, this.h + (this.h / 2));

			if (this.isBlack && this.showLines) { // Only show lines if both conditions are true
				beginClip({ invert: false });
				this.mask(p1, p2, p3, poster.posNormal.x);
				endClip();
				triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
				//this.mask(p1, p2, p3, poster.posNormal.x)
			} else {

				triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
			}


		} else {
			let isWhite = currentDigits.some(item => item[0] === this.i && item[1] === this.j);
			// Update target scale based on visibility
			this.targetScale = isWhite ? 1 : 0;
			// Animate scale
			this.scale = lerp(this.scale, this.targetScale, this.animationSpeed);
			// Apply scale transformation
			translate(this.w / 2, this.h / 2);
			scale(this.scale);
			translate(-this.w / 2, -this.h / 2);
			// draw
			let p4 = createVector(0, 0 - (this.h / 2))
			let p5 = createVector(this.w, this.h / 2)
			let p6 = createVector(0, this.h + (this.h / 2))
			triangle(p4.x, p4.y, p5.x, p5.y, p6.x, p6.y);
		}

		pop();

	}

	mask(p1, p2, p3, slider) {
		// make a rectangle using drawRectis from point p1 to p2, with 10 percent the width of the midpoint between line p1p2 and p3
		let midpoint = p5.Vector.add(p1, p2).div(2);
		let length = p5.Vector.dist(midpoint, p3) / 5;
		let moveDirection = p5.Vector.sub(midpoint, p3);
		moveDirection.normalize();
		offset = moveDirection.copy().mult(slider * length * 10);
		moveDirection.mult(length);
		p1 = p1.copy().add(offset);
		p2 = p2.copy().add(offset);
		p1.sub(moveDirection.copy().mult(4));
		p2.sub(moveDirection.copy().mult(4));

		//first big one
		beginShape();
		vertex(p1.x + moveDirection.x * 5, p1.y + moveDirection.y * 5);
		vertex(p1.x, p1.y);
		vertex(p2.x, p2.y);
		vertex(p2.x + moveDirection.x * 5, p2.y + moveDirection.y * 5);
		endShape(CLOSE);
		for (let i = 0; i < 3; i++) {
			noStroke();
			beginShape();
			vertex(p1.x - moveDirection.x, p1.y - moveDirection.y);
			vertex(p1.x, p1.y);
			vertex(p2.x, p2.y);
			vertex(p2.x - moveDirection.x, p2.y - moveDirection.y);
			endShape(CLOSE)
			p1.sub(moveDirection.copy().mult(2));
			p2.sub(moveDirection.copy().mult(2));
		}

	}




} 
