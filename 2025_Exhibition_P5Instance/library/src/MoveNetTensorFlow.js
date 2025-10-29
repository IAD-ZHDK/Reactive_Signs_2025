//Examples in https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/demos/live_video/src/camera.js
// https://github.com/tensorflow/tfjs-models/tree/master/pose-detection

// guide to running offline
// https://levelup.gitconnected.com/use-tensorflow-js-models-in-offline-applications-a7b5b0c67d4

import * as poseDetection from '@tensorflow-models/pose-detection';

//import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { stream_width, stream_height } from './webcam.js'

//import '@tensorflow/tfjs-backend-webgpu';

export let inferenceTimeSum = 0, lastPanelUpdate = 0, startInferenceTime = 0, numInferences = 0;
export let poses = [];

let rafId; // animation frame for pose detection


let lastPoseUpdate = 0;

export const AdjacentPairs = [[0, 1], [0, 2], [1, 3], [2, 4], [5, 6], [5, 7], [5, 11], [6, 8], [6, 12], [7, 9], [8, 10], [11, 12], [11, 13], [12, 14], [13, 15], [14, 16]]

export let POSE_CONFIG = {
    //maxPoses: 3,
    type: 'MULTIPOSE_LIGHTNING',
    scoreThreshold: 0.3,
    customModel: '',
    modelUrl: '/model.json',
    enableSmoothing: true,
    enableTracking: true
};
// 1920 X 1080
export let STATE = {
    camera: { targetFPS: 60, sizeOption: '640 X 480' },
    backend: '',
    flags: {},
    modelConfig: POSE_CONFIG,
};

let detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
    enableTracking: POSE_CONFIG.enableTracking,
    modelUrl: POSE_CONFIG.modelUrl,
    scoreThreshold: POSE_CONFIG.scoreThreshold,
    enableSmoothing: POSE_CONFIG.enableSmoothing,
    trackerType: poseDetection.TrackerType.BoundingBox
};
let detector;

let videoElement;

export async function setupMoveNet(video) {

    console.log("setupMoveNet");
    detectorConfig.modelUrl = POSE_CONFIG.modelUrl;
    videoElement = video;
    //stopMoveNet() // incase it's already running 

    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    poses = await detector.estimatePoses(videoElement, { maxPoses: STATE.modelConfig.maxPoses, flipHorizontal: true }); // maxpose and flip options don't apear to work
    rafId = requestAnimationFrame(renderResult);
    //console.log(poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet));
}
export async function stopMoveNet() {
    window.cancelAnimationFrame(rafId);
    if (detector != null) {
        detector.dispose();
    }
    poses = null;
}


export async function renderResult() {
    if (videoElement.readyState < 2) {
        await new Promise((resolve) => {
            camera.video.onloadeddata = () => {
                resolve(video);
            };
        });
    }

    poses = null;

    // Detector can be null if initialization failed (for example when loading
    // from a URL that does not exist).
    if (detector != null) {
        // FPS only counts the time it takes to finish estimatePoses.
        beginEstimatePosesStats();
        // Detectors can throw errors, for example when using custom URLs that
        // contain a model that doesn't provide the expected output.
        try {
            poses = await detector.estimatePoses(
                videoElement,
                { maxPoses: STATE.modelConfig.maxPoses, flipHorizontal: true });
        } catch (error) {
            detector.dispose();
            detector = null;
            console.log(error);
        }
        let imageSize = {
            width: stream_width,
            height: stream_height,
        }
        for (const pose of poses) {
            //  console.log(pose)
            pose.keypoints = poseDetection.calculators.keypointsToNormalizedKeypoints(pose.keypoints, imageSize);
        }

        endEstimatePosesStats();
    }

    // The null check makes sure the UI is not in the middle of changing to a
    // different model. If during model change, the result is from an old model,
    // which shouldn't be rendered.
    if (poses && poses.length > 0 && !STATE.isModelChanged) {

        lastPoseUpdate = window.performance.now();

        // find closest matching video
        // console.log(getClosestMatchOnScore(webcamData));
    } else {
        if (window.performance.now() - lastPoseUpdate > 1000) {
            console.log("no pose")
            lastPoseUpdate = window.performance.now() + 10000;

        }
    }
    // repeat
    rafId = requestAnimationFrame(renderResult);
}


function beginEstimatePosesStats() {
    startInferenceTime = (performance || Date).now();
}

// probably not so important:
function endEstimatePosesStats() {
    const endInferenceTime = (performance || Date).now();
    inferenceTimeSum += endInferenceTime - startInferenceTime;
    ++numInferences;
    const panelUpdateMilliseconds = 1000;
    if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
        const averageInferenceTime = inferenceTimeSum / numInferences;
        inferenceTimeSum = 0;
        numInferences = 0;
        //  stats.customFpsPanel.update(  1000.0 / averageInferenceTime, 120 /* maxValue */);
        lastPanelUpdate = endInferenceTime;
    }
}


