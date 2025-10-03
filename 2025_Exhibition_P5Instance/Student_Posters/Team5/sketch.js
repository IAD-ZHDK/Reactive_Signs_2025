window.sketch = function(p) {
  let gridCountX = 16;
  let gridCountY = 56;
  let offset = 3;
  let random10 = [];
  let nameArray = ['1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4'];
  let gridArray = Array(gridCountX).fill().map(() => Array(gridCountY).fill(null));
  let triangleList = [];
  let isBlackTriangles = [];
  let counter = 0;

  p.setup = function() {
    p.createCanvas(100, 100); // Don't remove this line.
    p.background(100);
    for (let i = 0; i < gridCountX; i++) {
      for (let j = 0; j < gridCountY; j++) {
        gridArray[i][j] = 0;
        triangleList.push(new TesoTriangle(i, j));
      }
    }
  };

  p.draw = function() {
    p.background(255);
    counter++;
    if (counter == 10) {
      console.log(random10);
      console.log(nameArray);
    }
    p.noStroke();
    for (let i = 0; i < triangleList.length; i++) {
      if (!triangleList[i].active) {
        triangleList[i].showTriangle();
      }
    }
  };

  p.windowResized = function() {
    for (let i = 0; i < triangleList.length; i++) {
      triangleList[i].updatePositions();
      console.log("count" + i);
    }
  };
  // ...rest of the code, convert all global functions to local and prefix p. for p5.js calls...
};
