class GlobalVariables {
    constructor() {
      this._pageWidth = 1080; // resolution 
      this._pageHeight = 1920; // resolution 
      this._vw = 1; // 1 percent of viewport width
      this._vh = 1; // 1 percent of viewport height
      this._screens = [{ x: 0, y: 0, w: 100, h: 100, cntX: 50, cntY: 50 }];
      this._position = null;
      this._posNormal = null;
    }
  
    get pageWidth() {
      return this._pageWidth;
    }
    get pageHeight() {
      return this._pageHeight;
    }

    get vw() {
      return this._vw;
    }
  
    set vw(value) {
      this._vw = value;
    }
  
    get vh() {
      return this._vh;
    }
  
    set vh(value) {
      this._vh = value;
    }
  
    get screens() {
      return this._screens;
    }
  
    updateScreen(index, screen) {
      if (index >= 0 && index < this._screens.length) {
        this._screens[index] = screen;
      }
    }
  
    get position() {
      return this._position;
    }
  
    set position(value) {
      this._position = value;
    }
  
    get posNormal() {
      return this._posNormal;
    }
  
    set posNormal(value) {
      this._posNormal = value;
    }
  }
  
  const globalVariables = new GlobalVariables();
  export default globalVariables;