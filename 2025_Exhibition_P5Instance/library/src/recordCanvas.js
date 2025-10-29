
export let recording = false;
let recorder;
let chunks = [];



export function recordCanvas() {
    recording = true;
    recorder.start();
    // add recording icon
    const newDiv = document.createElement("div");
    newDiv.id = "recordingSymbol"
    const newContent = document.createTextNode("◉");
    newDiv.appendChild(newContent);
    // add the newly created element and its content into the DOM
    newDiv.style.cssText = 'position:absolute;top:;right:0%;z-index:10000;color:#FF0000;';
    document.body.appendChild(newDiv)

}
export function stopRecordCanvas() {
    recording = false;
    recorder.stop();
    // remove recording icon
    const element = document.getElementById("recordingSymbol");
    element.remove(); // Removes the div with the 'div-02' id
}


export function recordSetup() {
    chunks.length = 0;
    let frameRate = 50
    let stream = document.querySelector('canvas').captureStream(frameRate);

    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = e => {
        if (e.data.size) {
            chunks.push(e.data);
        }
    };

    recorder.onstop = exportVideo;

}

function exportVideo(e) {
    var blob = new Blob(chunks, { 'type': 'video/webm' });

    // Draw video to screen
    var videoElement = document.createElement('video');
    videoElement.setAttribute("id", Date.now());
    videoElement.controls = true;
    videoElement.style.display = "none";
    document.body.appendChild(videoElement);
    videoElement.src = window.URL.createObjectURL(blob);

    // Download the video 
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url;
    a.download = 'newVid.webm';
    a.click();
    window.URL.revokeObjectURL(url);

}