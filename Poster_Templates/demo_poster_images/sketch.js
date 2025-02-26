let images = [];
let imagCount = 119; //119;


function preload() {
  for(let i=0;i<imagCount;i++) {
    let seriesNo = nf(i, 3); // this formats the index number into a string with 3 digits total. 
    images[i] = loadImage('images/image'+seriesNo+'.jpg'); // load up all images 
  }
}
function setup() {
  createCanvas(100,100); // poster is resized automatically 
  for(let i=0;i<imagCount;i++) {
    //make all images grey 
    images[i].filter(GRAY);
  }
   
}

function draw() {
  background(0);

  let i = getindex(poster.posNormal)

  image(images[i],0,0,width,height);
  fill(255,0,0);
}


function getindex(vector) {
  let normal = map(vector.x, 0.1, 0.9, 0.0, 1.0) // make sure we really get to the first and last frame 
  let max = imagCount-1
  let GoalIndex= round(imagCount*normal); // find index position of image based on normal of position x
      GoalIndex = constrain(GoalIndex,0,max);
  return GoalIndex 
}
