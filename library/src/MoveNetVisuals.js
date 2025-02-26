import { vh, vw } from './index.js'
import { AdjacentPairs, STATE } from './MoveNetTensorFlow.js'


const webcamW = 1280;
const webcamH = 720;

export const drawKeypoints = function (P5, keypoints) {
    if (keypoints != undefined) {
        P5.push()
        P5.stroke(P5.color(255, 0, 255))
        P5.strokeWeight((vh + vw) * 0.1);
        P5.noFill();
        let size = (vh + vw) * 1;
        for (let i = 0; i < keypoints.length; i++) {
            try {
                drawKeypoint(P5, keypoints[i], size)
            } catch (e) {
                // console.log(e)
            }
        }
    }
    P5.pop()
}

const drawKeypoint = function (P5, keypoint, size) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = STATE.modelConfig.scoreThreshold || 0;

    if (score >= scoreThreshold) {
        let xx = (keypoint.x) * P5.width;
        let yy = keypoint.y * P5.height;
        P5.circle(xx, yy, size);
    }
}


export const drawKeypointsNumber = function (P5, keypoints, poseId) {
    if (keypoints != undefined) {
        P5.push()
        P5.noStroke()
        P5.fill(P5.color(255, 0, 255));
        P5.textSize(23);
        let size = (vh + vw) * 1;
        for (let i = 0; i < keypoints.length; i++) {
            try {
                const score = keypoints[i].score != null ? keypoints[i].score : 1;
                const scoreThreshold = STATE.modelConfig.scoreThreshold || 0;
            
                if (score >= scoreThreshold) {
                    let xx = (keypoints[i].x) * P5.width;
                    let yy = keypoints[i].y * P5.height; 0
                    P5.text(poseId+"_"+i, xx+3, yy+3);
                }
            } catch (e) {
                // console.log(e)
            }
        }
    }
    P5.pop()
}

export const drawBoundingBox = function (P5, box, poseId) {
    const color = P5.color(0, 255, 255);
    P5.push()
    P5.strokeWeight((vh + vw) * 0.3);
    P5.stroke(color)
    P5.noFill();
    P5.rect(box.xMin * P5.width, box.yMin * P5.height, box.width * P5.width, box.height * P5.height)
    P5.pop()
}

// A function to draw the skeletons
export const drawSkeleton = function (P5, keypoints, poseId) {
    // Each poseId is mapped to a color in the color palette.
    //const color = poseId != null ?
    //    COLOR_PALETTE[poseId % COLOR_PALETTE.length] :
    //    'White';
    const color = P5.color(255, 0, 255);
    P5.push();
    P5.stroke(color);
    P5.strokeWeight((vh + vw) * 0.25);

    AdjacentPairs.forEach(([
        i, j
    ]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;
        const scoreThreshold = STATE.modelConfig.scoreThreshold || 0;
        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
            let x0 = (kp1.x) * P5.width;
            let y0 = kp1.y * P5.height;
            let x1 = (kp2.x) * P5.width;
            let y1 = kp2.y * P5.height;
            P5.line(x0, y0, x1, y1);
        }
    });
    P5.pop();
}