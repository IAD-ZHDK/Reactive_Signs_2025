import { poses, STATE, AdjacentPairs} from './MoveNetTensorFlow.js'
import { drawKeypoints, drawSkeleton, drawKeypointsNumber, drawBoundingBox} from './MoveNetVisuals.js'
import {camera} from './index.js'

export const webCamSketch = (p) => {
    let w = 300.0;
    let h = 300.0;
    let vw = 2;
    let vh = 2;
    let webcamW = 1280;
    let webcamH = 720;
    let offsetX = 10;
    let offsetY = 10;
   
    const COLOR_PALETTE = [
        p.color(255, 0, 255), p.color(240, 180, 0, 150), p.color(255, 0, 255, 150), p.color(255, 255, 255, 180)
    ];

    const drawResults = function (poses) {
        if (poses != undefined) {
            let index = 0;
            for (const pose of poses) {
                drawKeypoints(p, pose.keypoints);
                drawKeypointsNumber(p, pose.keypoints, pose.id);
                drawSkeleton(p, pose.keypoints, pose.id);
                drawBoundingBox(p, pose.box, pose.id);
               // drawID(pose.box, pose.id);
               // drawVector(velocities[index], pose)
                index++;
            }
        }
    }


    /////////////////////////
    /// P5 Events
    ///////////////////////


    p.setup = function () {
        console.log("new sketch")
        w = camera.video.width;
        h = camera.video.height;
        p.createCanvas(w, h);
    }

    p.draw = function () {
        p.clear();
        p.noStroke();
        drawResults(poses)
    }
}