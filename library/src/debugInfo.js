  /**
   * Updates the position of the poster based on pose detection or realsense data
   * received over OSC. If no signal is received, the position is updated based on
   * the mouse position. 
   */
  import globalVariables from './globalVariables';
  import {OSCtracking, oscSignal} from './OSC_Control.js'
let fpsAverage = 0;

export function debugInfo(P5Instance) {
      let vw = globalVariables.vw;
      let vh = globalVariables.vh;
      let screens = globalVariables.screens;
      let position = globalVariables.position;
     // gui.show();
     // showWebCamPreview(true);
      P5Instance.push();
      if (P5Instance._renderer.drawingContext instanceof WebGL2RenderingContext) {
        P5Instance.translate(-P5Instance.width / 2, -P5Instance.height / 2, 0);
      }
      P5Instance.fill(0, 180, 180);
      P5Instance.noStroke();
      fpsAverage = fpsAverage * 0.9;
      fpsAverage += P5Instance.frameRate() * 0.1;
      P5Instance.textSize(2.2 * vw);
      P5Instance.textAlign(P5Instance.LEFT, P5Instance.TOP);
      P5Instance.text("fps: " + Math.floor(fpsAverage), screens[0].x + vw, screens[0].y + vh * 1);
      P5Instance.text("Streaming: " + oscSignal, screens[0].x + vw, screens[0].y + vh * 3);
      P5Instance.text("Tracking: " + OSCtracking, screens[0].x + vw, screens[0].y + vh * 5);
      P5Instance.text("Shift - r start record", screens[0].x + vw, screens[0].y + vh * 7);
      P5Instance.text("Shift - s stop record ", screens[0].x + vw, screens[0].y + vh * 8);
      P5Instance.text("Shift - p hide guides", screens[0].x + vw, screens[0].y + vh * 9);
      P5Instance.noFill();
      P5Instance.stroke(0, 180, 180);
      P5Instance.rectMode(P5Instance.CORNER);
      P5Instance.rect(screens[0].x, screens[0].y, P5Instance.width, P5Instance.height);
      // line between screens
      for (let i = 1; i < screens.length; i++) {
        screens[i].w = P5Instance.floor(width / screens.length);
        P5Instance.line(screens[i].x, screens[i].y, screens[i].x, screens[i].y + screens[i].h); // line between multiple screens
      }
      // Format lines for 2024, show squate in the center. 
      let line1y = (P5Instance.height - P5Instance.width) / 2;
      let line2y = line1y + P5Instance.width;
      P5Instance.line(screens[0].x, line1y, screens[0].x + screens[0].w, line1y); // top    
      P5Instance.line(screens[0].x, line2y, screens[0].x + screens[0].w, line2y); // top    
      //
      P5Instance.fill(0, 180, 180);
      P5Instance.noStroke();
      P5Instance.circle(position.x, position.y, position.z * 10);
      P5Instance.pop();
  }