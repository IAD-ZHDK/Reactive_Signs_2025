//NEU
// ========== BACKGROUND GIF SETTINGS ==========
const BG_SETTINGS = {
  gifPath: 'Hintergrund_Code.jpg',
  opacity: 5,                   // ANGEPASST: von 15 auf 5 für dunkleren Hintergrund
  fitMode: 'stretch',           // 'cover', 'contain', or 'stretch'
  tint: [255, 255, 255],
  enabled: true
};

// ========== GIF SPOTLIGHT SETTINGS ==========
const SPOTLIGHT_SETTINGS = {
  enabled: true,
  maxOpacity: 220,            // ANGEPASST: von 180 auf 220 für mehr Kontrast
  radius: .7,               // Spotlight radius bis max 1.0
  softness: 1,              // Edge softness (0 = hard edge, 1 = very soft)
  easing: 0.1,             // How fast the spotlight follows (0.01-0.3)

  // Sine Wave Path Settings
  sineWaveEnabled: true,          // Enable sine wave path for Y position
  sineAmplitude: 0.35,           // How far up/down the wave goes (0.25 = 25% of screen height)
  sineFrequency: 2.0,           // How many complete waves across the screen (1.0 = one full wave)
  sineOffset: 0.35,             // Vertical center of the wave (0.35 = upper third of screen)

  // Off-screen Settings
  allowOffscreen: true,       // Allow spotlight to move off-screen
  offscreenMargin: 2.5       // Extra margin beyond screen edge (0.5 = half screen width/height)
};


// ========== MOUSE ATTRACTION SETTINGS ==========
const ATTRACTION_SETTINGS = {
  enabled: true,                 // Enable/disable mouse attraction effect
  radiusScale: 0.40,            // Attraction radius as factor of height (0.35 = 35% of screen height)
  maxPullX: 20,                // Maximum horizontal push distance in pixels
  maxPullY: 10,               // Maximum vertical push distance in pixels
  falloffPower: 5,           // How quickly effect fades (higher = faster fadeout, 1-10 recommended)

  // Push Effect Settings (separate from highlight!)
  pushIntensity: 1.0,         // push-effect an oder aus

  // Text Highlight Settings
  highlightIntensity: 0.0,    // Overall intensity of color highlight (0.0 = no highlight, 1.0 = full highlight)
  //highlightColor: [255, 255, 255],  // Color for highlighted text (RGB)
  useCustomHighlight: false,  // If true, uses highlightColor instead of TEXT_SETTINGS.highlightColor
  minOpacity: 1.0,            // Minimum opacity at edge of circle (0.0-1.0)
  maxOpacity: 1.0,            // Maximum opacity at center of circle (0.0-1.0)

  // Gradient/Falloff Shape
  gradientType: 'linear',      // 'power', 'linear', or 'smooth' - how the effect fades
  innerRadiusScale: 0.9       // Inner radius where effect is at maximum (0.0-1.0 of radiusScale)
};


// ========== TEXT SETTINGS (EASY TO ADJUST) ==========
const TEXT_SETTINGS = {
  fontSize: 3.6,                                      // Font size
  fontFamily: 'ITC Century Std Light.otf',         // Font family für Text
  lineSpacing: 1.1,                               // Line spacing multiplier (1.0 = no extra space, 1.5 = 50% extra)
  margin: 4,                                     // Margin from edges (in poster.vw units)
  highlightColor: [255, 255, 255],              // Color for highlighted text (weiss)
  defaultColor: [50, 50, 50],                  // ANGEPASST: von [80,80,80] auf [50,50,50] für mehr Kontrast
  transitionDuration: 1000,                   // Animation Dauer
  slideDistance: 10,                         // Zeilen-Verschiebung x-Achse

  // Highlight Number Settings
  backgroundFontFamily: 'CenturyStd-Book.otf',   // Font family for the background number
  numberHeightScale: 0.21,                      // Size of the highlight number (0.9 = 90% of window height)
  numberColor: [255, 255, 255],                // Color of the highlight number (RGB: white)
  numberOpacity: 255,                         // Opacity of the highlight number (0-255)
  numberVerticalOffset: -.01                  // Vertical offset in pixels (positive = down, negative = up)
};


let textContent = [
  "In 2025, the Museum für Gestaltung Zürich is celebrating the 150th anniversary of its founding. A banner year that presents the perfect occasion not only to take a look back at the history of the museum but also to examine current developments in the field of design and venture an outlook toward the future. A variety program of exhibitions and activities will take place throughout the anniversary year. One highlight is the grand opening in mid-April of the new permanent exhibition Swiss Design Collection at the Toni-Areal, accompanied by a whole weekend of festivities. In recent years, the Museum für Gestaltung Zürich has further strengthened its position as a leading museum of design and visual communication. With innovative exhibitions and interactive formats, it attracts a wide audience, promoting an ongoing dialogue on the latest trends and social issues in design. The museum explores design in all its diversity, presenting outstanding works to the public while also addressing today's digital transformation and fostering exchange and networking within the global design community. The museum places special emphasis on inclusion and sustainability and is committed to making its exhibitions and activities as broadly accessible and resource-efficient as possible. The diverse program is geared toward people of varied age groups and cultural backgrounds. In an effort to appeal to a broad international audience, the museum offers information and guided tours in several languages as well as simple German. On our 150th anniversary, we respectfully remember our past while looking confidently to the future. We want to continue to serve as a platform for innovative exhibitions, for safeguarding and preserving outstanding works, and for creative exchange. Our program endeavors to convey the enormous importance of design in a fun and exciting way so that as many people as possible can be inspired by good design, says Christian Brändle, director of the museum. The year kicks off with a special program at the museum's Ausstellungsstrasse location. The admission-free exhibition Jakob Kudsk Steensen: Berl-Berl turns the lecture hall into an immersive installation that will continually be reconfigured in real time by dedicated game engines. The unique 1933 building will be additionally enlivened in January by a range of activities for young and old, including behind-the-scenes architecture tours, design talks, workshops, one-off sales, a bar, a screen-printing studio, game events, and musical performances."];

let words = [];
let numberGraphics;
let allNumberGraphics = [];
let lastCounter = -1;
let oldNumberGraphics;
let transitionProgress = 1;
let transitionDuration = TEXT_SETTINGS.transitionDuration;
let transitionStartTime = 0;
let lineSlideParams = {};

let mainTextFont;
let backgroundFont;
let backgroundGif;

// Spotlight state (smoothed position)
let spotlightX = 0;
let spotlightY = 0;

// Spotlight mask buffer
let spotlightMask;

// Schrift und GIF laden
function preload() {
  mainTextFont = loadFont(TEXT_SETTINGS.fontFamily);
  backgroundFont = loadFont(TEXT_SETTINGS.backgroundFontFamily);

  // GIF laden wenn aktiviert
  if (BG_SETTINGS.enabled) {
    backgroundGif = loadImage(BG_SETTINGS.gifPath);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1); // ANGEPASST: Aktiviert um Museum-Setup zu simulieren


  createSpotlightMask(width, height, SPOTLIGHT_SETTINGS.radius, SPOTLIGHT_SETTINGS.softness);
  // Initial spotlight position
  spotlightX = width / 2;
  spotlightY = height / 2;

  layoutText();

  for (let i = 0; i <= 9; i++) {
    allNumberGraphics[i] = createNumberGraphics(i);
  }

  numberGraphics = allNumberGraphics[0]
  oldNumberGraphics = allNumberGraphics[9]
  console.log(words.length)
}

function createSpotlightMask(w, h, radius, softness) {
  // Spotlight mask buffer erstellen
  spotlightMask = createGraphics(w * 2.1, h * 2.1);
  spotlightMask.clear();
  spotlightMask.translate(spotlightMask.width / 2, spotlightMask.height / 2)
  let size = h * radius;
  let maxRadius = sqrt(spotlightMask.width * spotlightMask.width + spotlightMask.height * spotlightMask.height);
  spotlightMask.strokeWeight(softness * 4);
  for (let r = size - (w * 0.8); r < maxRadius; r += softness * 4) {
    let lightness = map(r, size - (w * 0.6), size, 0, 255)
    lightness = constrain(lightness, 0, 255);
    let c = color(0, 0, 0, lightness)
    spotlightMask.noFill();
    spotlightMask.stroke(c)
    spotlightMask.ellipse(0, 0, r, r)
  }

}


function layoutText() {
  words = [];
  let margin = TEXT_SETTINGS.margin * poster.vw;
  let x = margin;
  let y = margin + TEXT_SETTINGS.fontSize * poster.vw;
  let maxWidth = width - margin * 2;
  let fontSize = TEXT_SETTINGS.fontSize * poster.vw;
  let lineHeight = fontSize * TEXT_SETTINGS.lineSpacing;

  textFont(mainTextFont);
  textSize(fontSize);

  let allText = textContent.join(' ');
  let allWords = allText.split(' ');

  let currentLine = [];
  let currentLineWidth = 0;
  let lineIndex = 0;

  allWords.forEach((word, index) => {
    let w = textWidth(word + ' ');
    if (currentLineWidth + w > maxWidth && currentLine.length > 0) {
      justifyLine(currentLine, x, y, maxWidth, index === allWords.length - 1, fontSize, lineIndex);
      currentLine = [word];
      currentLineWidth = w;
      y += lineHeight;
      lineIndex++;
    } else {
      currentLine.push(word);
      currentLineWidth += w;
    }
  });
  if (currentLine.length > 0) {
    currentLine.forEach(word => {
      let w = textWidth(word + ' ');
      words.push({
        text: word,
        x: x,
        y: y,
        w: w,
        line: lineIndex
      });
      x += w;
    });
    lineIndex++;
  }
}

function justifyLine(lineWords, startX, yPos, maxWidth, isLastLine, fontSize, lineIndex) {
  if (lineWords.length === 0) return;
  textFont(mainTextFont);
  textSize(fontSize);
  let totalWordWidth = 0;
  lineWords.forEach(word => {
    totalWordWidth += textWidth(word);
  });
  let totalSpace = maxWidth - totalWordWidth;
  let spaceCount = lineWords.length - 1;
  let spaceWidth = spaceCount > 0 ? totalSpace / spaceCount : 0;
  if (isLastLine || lineWords.length === 1) {
    spaceWidth = textWidth(' ');
  }
  let x = startX;
  lineWords.forEach(word => {
    let w = textWidth(word);
    words.push({
      text: word,
      x: x,
      y: yPos,
      w: w,
      line: lineIndex
    });
    x += w + spaceWidth;
  });
}

// Berechne die Spotlight Y-Position basierend auf einer Sinuswelle
function calculateSineWaveY(normalizedX) {
  if (!SPOTLIGHT_SETTINGS.sineWaveEnabled) {
    // Wenn keine Sinuswelle, folge einfach der Y-Position der Person
    // (oder gehe aus dem Bildschirm wenn allowOffscreen aktiv)
    if (SPOTLIGHT_SETTINGS.allowOffscreen) {
      return poster.posNormal.y * height;
    }
    return constrain(poster.posNormal.y, 0, 1) * height;
  }

  // Sinuswelle berechnen
  // normalizedX kann auch < 0 oder > 1 sein (Person ausserhalb des Bildschirms)
  let sineValue = sin(normalizedX * PI * 2 * SPOTLIGHT_SETTINGS.sineFrequency);

  // sineValue ist zwischen -1 und 1
  // Wir mappen das auf die gewünschte Amplitude um den Offset herum
  let centerY = height * SPOTLIGHT_SETTINGS.sineOffset;
  let amplitude = height * SPOTLIGHT_SETTINGS.sineAmplitude;

  let baseY = centerY + sineValue * amplitude;

  // Wenn Person ausserhalb, Spotlight zusätzlich nach oben/unten verschieben
  if (SPOTLIGHT_SETTINGS.allowOffscreen) {
    let margin = height * SPOTLIGHT_SETTINGS.offscreenMargin;
    if (normalizedX < 0) {
      // Person links vom Bildschirm - Spotlight nach oben/unten basierend auf Wellenphase
      baseY += margin * abs(normalizedX) * sign(sineValue);
    } else if (normalizedX > 1) {
      // Person rechts vom Bildschirm
      baseY += margin * (normalizedX - 1) * sign(sineValue);
    }
  }

  return baseY;
}

// Hilfsfunktion für Vorzeichen
function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}



// Funktion zum Zeichnen des Hintergrund-GIFs mit Spotlight
function drawBackgroundGif() {
  image(backgroundGif, 0, 0, width, height);
  push()

  //translate(width / 2, height / 2);
  translate(-spotlightMask.width / 2, -spotlightMask.height / 2);
  translate(spotlightX, spotlightY);
  image(spotlightMask, 0, 0);

  pop();

}

function createNumberGraphics(currentCounter) {

  lineSlideParams = buildLineParams();

  // Neues Graphics fuer die Zahl
  let graphics = createGraphics(floor(width * 0.05), floor(height * 0.05));
  graphics.textFont(backgroundFont);
  //graphics.pixelDensity(1);
  // Referenzgroesse fuer Messung
  //graphics.textSize(refSize);

  // Zielhoehe: aus Settings

  let numberSize = graphics.height * 0.9;
  // endgueltige Groesse setzen
  graphics.textSize(numberSize);
  //graphics.background(255, 0, 0);

  // Zahl zentriert in der Mitte des Offscreen-Canvas zeichnen (mit vertikalem Offset)
  //graphics.clear();                     // transparenter Hintergrund
  //graphics.textAlign(CENTER, CENTER);   // horizontal + vertikal zentriert
  // graphics.background(255, 0, 0);
  graphics.fill(255);
  graphics.textAlign(CENTER, CENTER);
  graphics.text(currentCounter.toString(), graphics.width / 2, graphics.height / 2 - (TEXT_SETTINGS.numberVerticalOffset * graphics.height));
  // return objects with pixel values, width, height
  let pixelArray = [];
  for (let y = 0; y < graphics.height; y++) {
    for (let x = 0; x < graphics.width; x++) {
      let px = graphics.get(x, y);
      // Set alpha based on brightness threshold
      if (px[0] < 128) {
        pixelArray.push(0); // transparent
      } else {
        pixelArray.push(255); // opaque white
      }
    }
  }
  let graphicsObject = {
    pixel: pixelArray,
    width: graphics.width,
    height: graphics.height
  };
  return graphicsObject;
}

function draw() {
  push();
  background(0, 0, 0);  // ANGEPASST: von (10,10,10) auf reines Schwarz für maximalen Kontrast
  translate(-width / 2, -height / 2); // offset for WEBGL mode
  spotlight();
  // Hintergrund-GIF mit Spotlight zeichnen
  drawBackgroundGif();


  // Only create graphics buffer when counter changes
  let currentCounter = poster.getCounter();
  if (currentCounter !== lastCounter) {
    oldNumberGraphics = numberGraphics;
    numberGraphics = allNumberGraphics[currentCounter]
    // Transition starten
    transitionStartTime = millis();
    transitionProgress = 0;
    lastCounter = currentCounter;
  }

  // Rest der draw()-Funktion bleibt unveraendert ...
  if (transitionProgress < 1) {
    let elapsed = millis() - transitionStartTime;
    transitionProgress = constrain(elapsed / transitionDuration, 0, 1);

    if (transitionProgress >= 1 && oldNumberGraphics) {
      // oldNumberGraphics.remove();
      //oldNumberGraphics = null;
    }
  }

  let easeProgress = easeInOutCubic(transitionProgress);
  let slideRange = TEXT_SETTINGS.slideDistance * poster.vw;

  textFont(mainTextFont);
  textSize(TEXT_SETTINGS.fontSize * poster.vw);
  textAlign(LEFT, BASELINE);
  noStroke();

  // Attraction settings (from ATTRACTION_SETTINGS)
  // Use the same sine wave path as the spotlight!
  let attractX = spotlightX;
  let attractY = spotlightY;
  let attractRadius = height * ATTRACTION_SETTINGS.radiusScale;

  words.forEach(word => {
    let color = TEXT_SETTINGS.defaultColor;
    let params = lineSlideParams[word.line] || { dir: 1, dist: TEXT_SETTINGS.slideDistance * poster.vw };
    let dir = params.dir;
    let slidePhase = transitionProgress < 1 ? sin(PI * easeProgress) : 0;
    let textOffsetX = dir * params.dist * slidePhase;

    // Calculate attraction based on distance to person
    let wordCenterX = word.x + word.w / 2;
    let wordCenterY = word.y;

    // 2D distance to person
    let distX = wordCenterX - attractX;
    let distY = wordCenterY - attractY;
    let totalDist = sqrt(distX * distX + distY * distY);

    // Calculate base strength (used for both push and highlight)
    let baseStrength = 0;
    let attractOpacity = 1.0;

    if (ATTRACTION_SETTINGS.enabled && totalDist < attractRadius) {
      // Apply inner radius for two-zone gradient
      let innerRadius = attractRadius * ATTRACTION_SETTINGS.innerRadiusScale;

      if (totalDist < innerRadius) {
        // Inside inner radius: full strength
        baseStrength = 1.0;
      } else {
        // Outside inner radius: fade out
        let outerNormalizedDist = (totalDist - innerRadius) / (attractRadius - innerRadius);
        baseStrength = constrain(1 - outerNormalizedDist, 0, 1);
      }

      // Apply gradient type
      if (ATTRACTION_SETTINGS.gradientType === 'linear') {
        // Already linear
      } else if (ATTRACTION_SETTINGS.gradientType === 'smooth') {
        // Smoothstep interpolation
        baseStrength = baseStrength * baseStrength * (3 - 2 * baseStrength);
      } else {
        // 'power' - use falloffPower
        baseStrength = pow(baseStrength, ATTRACTION_SETTINGS.falloffPower);
      }
    }

    // Separate strengths for push and highlight
    let pushStrength = baseStrength * ATTRACTION_SETTINGS.pushIntensity;
    let highlightStrength = baseStrength * ATTRACTION_SETTINGS.highlightIntensity;

    // Calculate opacity for this word based on distance
    attractOpacity = lerp(ATTRACTION_SETTINGS.minOpacity, ATTRACTION_SETTINGS.maxOpacity, highlightStrength);

    // Push AWAY from person (uses pushStrength, not highlightStrength!)
    let attractOffsetX = 0;
    let attractOffsetY = 0;
    if (totalDist > 0 && pushStrength > 0) {
      attractOffsetX = (distX / totalDist) * ATTRACTION_SETTINGS.maxPullX * pushStrength;
      attractOffsetY = (distY / totalDist) * ATTRACTION_SETTINGS.maxPullY * pushStrength;
    }

    // Total offsets
    let totalOffsetX = textOffsetX + attractOffsetX;
    let totalOffsetY = attractOffsetY;

    // Check number mask
    let numberStrength = 0;
    if (transitionProgress < 1 && oldNumberGraphics) {
      let oldOverlaps = checkOverlapPrecise(word, oldNumberGraphics, 0, totalOffsetY, totalOffsetX);
      let newOverlaps = checkOverlapPrecise(word, numberGraphics, 0, totalOffsetY, totalOffsetX);
      if (oldOverlaps) numberStrength = max(numberStrength, 1 - easeProgress);
      if (newOverlaps) numberStrength = max(numberStrength, easeProgress);
    } else {
      let overlaps = checkOverlapPrecise(word, numberGraphics, 0, totalOffsetY, totalOffsetX);
      if (overlaps) numberStrength = 1;
    }

    // Combine: attraction highlight OR number highlights the word
    let totalColorStrength = max(highlightStrength, numberStrength);

    // Choose highlight color (custom or from TEXT_SETTINGS)
    let targetHighlightColor = ATTRACTION_SETTINGS.useCustomHighlight
      ? ATTRACTION_SETTINGS.highlightColor
      : TEXT_SETTINGS.highlightColor;

    let colorValue = lerp(TEXT_SETTINGS.defaultColor[0], targetHighlightColor[0], totalColorStrength)
    color = [
      colorValue,
      colorValue,
      colorValue
    ];

    // Apply opacity (only affects attraction, not number highlight)
    let finalOpacity = numberStrength > 0 ? 255 : attractOpacity * 255;

    fill(color[0], color[1], color[2], finalOpacity);
    let xPos = word.x + totalOffsetX;
    if (word.y + totalOffsetY < height) {
      text(word.text, xPos, word.y + totalOffsetY);
    }
    //console.log(word.text);
  });
  //console.log(currentCounter)
  // image(allNumberGraphics[currentCounter], 0, 0);
  pop();
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function checkOverlapPrecise(word, pg, offsetX = 0, offsetY = 0, textOffsetX = 0) {
  if (!pg) return false;
  //console.log(pg);
  let wordHeight = TEXT_SETTINGS.fontSize * poster.vw;
  let samples = 3;
  for (let i = 0; i < samples; i++) {
    let sampleX = word.x + textOffsetX + (word.w * i / (samples - 1)) - offsetX;
    let sampleY = word.y - wordHeight / 2 - offsetY;
    for (let j = 0; j < 2; j++) {
      let checkY = sampleY + (wordHeight * j);
      if (sampleX >= 0 && sampleX < width && checkY >= 0 && checkY < height) {
        let x = floor((sampleX / width) * pg.width);
        let y = floor((checkY / height) * pg.height);
        let index = y * pg.width + x;
        pg.pixel[index]
        let px = pg.pixel[index];
        if (px > 128) {
          return true;
        }
      }
    }
  }
  return false;
}

function windowResized() {
  //resizeCanvas(windowWidth, windowHeight);

  // Spotlight mask buffer neu erstellen
  //spotlightMask.resizeCanvas(width, height);
  layoutText();
  createSpotlightMask(width, height, SPOTLIGHT_SETTINGS.radius, SPOTLIGHT_SETTINGS.softness);
  for (let i = 0; i <= 9; i++) {
    allNumberGraphics[i] = createNumberGraphics(i);
  }

  lastCounter = -1; // Force recreation of number graphics
}

function buildLineParams() {
  let maxLine = -1;
  words.forEach(w => {
    if (w.line > maxLine) maxLine = w.line;
  });
  let params = {};
  for (let i = 0; i <= maxLine; i++) {
    params[i] = {
      dir: random([-1, 1]),
      dist: TEXT_SETTINGS.slideDistance * poster.vw * random(0.5, 1.6)
    };
  }
  return params;
}

function spotlight() {
  // X-Position folgt der Person (kann über den Bildschirmrand hinausgehen)
  let normalizedX = poster.posNormal.x;
  let targetX;

  if (SPOTLIGHT_SETTINGS.allowOffscreen) {
    // Erlaube Positionen ausserhalb des Bildschirms
    // posNormal.x kann Werte < 0 oder > 1 haben wenn Person den Bereich verlässt
    let margin = width * SPOTLIGHT_SETTINGS.offscreenMargin;
    targetX = normalizedX * width;
    // Wenn Person weit weg ist, Spotlight weiter rausschieben
    if (normalizedX < 0) {
      targetX = normalizedX * width - margin * abs(normalizedX);
    } else if (normalizedX > 1) {
      targetX = normalizedX * width + margin * (normalizedX - 1);
    }
  } else {
    targetX = constrain(normalizedX, 0, 1) * width;
  }

  // Y-Position folgt der Sinuswelle basierend auf X-Position
  let targetY = calculateSineWaveY(normalizedX);

  // Smooth spotlight position
  spotlightX += (targetX - spotlightX) * SPOTLIGHT_SETTINGS.easing;
  spotlightY += (targetY - spotlightY) * SPOTLIGHT_SETTINGS.easing;

}