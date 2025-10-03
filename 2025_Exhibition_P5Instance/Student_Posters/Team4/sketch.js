window.sketch = function(p) {
  let cols = 9;
  let rows = 16;
  let tileArray = [];
  let spikey1, spikey2, spikey3, spikey4, spikey5, spikey6;
  let one, two, three, four, five, six, seven, eight, nine, zero;
  let numbers = [];
  let mousePos;
  let tileSize = 0;
  let switchCount = 0;
  let currentGridNumber = 0;
  let oldGridNumber = 0;
  let font;

  p.preload = function() {
    const BASE_PATH = window.basePath;
    font = p.loadFont(`${BASE_PATH}Montserrat-Black.otf`);
    font = p.loadFont(`${BASE_PATH}Montserrat-Black.ttf`); // fallback font
  };

  p.setup = function() {
    p.createCanvas(100, 100); // Don't remove this line.
    p.textFont(font);
    p.rectMode(p.CORNER);
    updateTiles();
    // Spikeys
    spikey1 = new Spikey(p.width / 2, p.height / 2, 300 * poster.vw);
    spikey2 = new Spikey(p.width / 2, p.height / 2, 300 * poster.vw);
    spikey3 = new Spikey(p.width / 2, p.height / 2, 300 * poster.vw);
    spikey4 = new Spikey(p.width / 2, p.height / 2, 300 * poster.vw);
    spikey5 = new Spikey(p.width / 2, p.height / 2, 300 * poster.vw);
    spikey6 = new Spikey(p.width / 2, p.height / 2, 300 * poster.vw);
    // ...existing code for grid and numbers...
  };

  // ...rest of the code, convert all global functions to local and prefix p. for p5.js calls...
};
