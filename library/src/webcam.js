export let stream_width = 0;
export let stream_height = 0;


export class Camera {
  constructor(webCam) {
  }

  static async setup(video) {
    const camera = new Camera();
    camera.video = video;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
          'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    let constraints = {
      audio: false,
      video: {
        width: { ideal: 1920 }, //1920
        height: { ideal: 1080 }//1080
      }
    }


    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(video);
      };
    });

    camera.video.play();

     stream_width = camera.video.videoWidth;
     stream_height = camera.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    camera.video.width = stream_width/4;
    camera.video.height = stream_height/4;

    console.log('Width: ' + stream_width + 'px');
    console.log('Height: ' + stream_height + 'px');

    return camera;

  }


}