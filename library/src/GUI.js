import * as dat from 'dat.gui';

let callback;

function functionCallback() {
    // callback
    console.log("test")
}

function datGuiCallback() {
    // callback

}


export function setUpGui(Settings, callback) {
    
    const gui = new dat.GUI();
    let guiFolder = gui.addFolder('Options')
    addToGui(Settings, guiFolder, callback)
    // Make the DIV element draggable:
  
    return gui;
}

function addToGui(obj, folder, bindCallback) {
    for (const key in obj) { // for each key in your object
        if (obj.hasOwnProperty(key)) {
            let val = obj[key]
            if (typeof val === 'object') {
                let newFolder = folder.addFolder(key)
                addToGui(val, newFolder, bindCallback) // if the key is an object itself, call this function again to loop through that subobject, assigning it to the same folder
            } else if (typeof val === 'number') { // if the value of the object key is a number, establish limits and step
                let step, min, limit
                if (key === 'maxPoses') {
                    min = 0
                    step = 1
                    limit = 5
                } else { // otherwise, calculate the limits and step based on # of digits in the number
                    min = 0
                    limit = 1.0
                    step = 0.1
                }
                folder.add(obj, key, min, limit).step(step).onChange(function () {
                    bindCallback()
                })// add the value to GUI folder
            } else if (typeof val === 'boolean') {
                folder.add(obj, key).onChange(function () {
                    bindCallback()
                }) // add a button to GUI folder
            } else if (typeof val === 'function') {
                console.log(val)
                folder.add(obj, key).onChange(function () {
                    val();
                }) // add a radio button to GUI folder
            } else if (typeof val === 'string') {
                let props = {
                    doNothing: function () {
                    }
                };
                folder.add(props, 'doNothing')
                    .name(key + ": " + val);
            } else {
                folder.add(obj, key).onChange(function () {
                    bindCallback()
                }) // ...this would include things like boolean values as checkboxes,
            }
        }
    }
}


export function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
