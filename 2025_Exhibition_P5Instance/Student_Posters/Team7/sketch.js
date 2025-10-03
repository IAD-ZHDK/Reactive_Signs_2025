window.sketch = function(p) {
  let images = [];
  let aspectRatio = 1.375;
  let previousCounter = -1;
  let increment = 0.05;
  let incomingImage;
  let outgoingImage;
  let startInScale;
  let startOutScale;
  let transitionInScale = 0;
  let transitionOutScale = 1.7;
  let targetInScale = 1.7;
  let targetOutScale = 4.6;
  let transitionInIncrement = 0.06;
  let transitionOutIncrement = 0.09;
  let incomingRotation = 0;
  let mappedViewerX;
  let mappedViewerY;
  let originalViewerX;
  let originalViewerY;
  let blurAmount;
  let currentOutgoingAnchor = { x: 0.5, y: 0.5 };
  let currentIncomingAnchor = { x: 0, y: 0 };
  let totalDuration;
  let timePassed;
  let timePassed2;
  let smallAnchorPoints = [
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0.04 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }
  ];
  // ...rest of the code, convert all global functions to local and prefix p. for p5.js calls...
};
