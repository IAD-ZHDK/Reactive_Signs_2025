// ========== BACKGROUND GIF SETTINGS ==========
const BG_SETTINGS = {
  gifPath: 'Hintergrund_Code.jpg',
  opacity: 15,
  fitMode: 'stretch',           // 'cover', 'contain', or 'stretch'
  tint: [255, 255, 255],
  enabled: true
};

// ========== GIF SPOTLIGHT SETTINGS ==========
const SPOTLIGHT_SETTINGS = {
  enabled: true,
  maxOpacity: 180,            // Maximum opacity 0-255
  radius: 0.2,               // Spotlight radius bis max 1.0
  softness: 1,              // Edge softness (0 = hard edge, 1 = very soft)
  easing: 0.1,             // How fast the spotlight follows (0.01-0.3)

  // Sine Wave Path Settings
  sineWaveEnabled: true,          // Enable sine wave path for Y position
  sineAmplitude: 0.25,           // How far up/down the wave goes (0.25 = 25% of screen height)
  sineFrequency: 2.0,           // How many complete waves across the screen (1.0 = one full wave)
  sineOffset: 0.35,             // Vertical center of the wave (0.35 = upper third of screen)

  // Off-screen Settings
  allowOffscreen: true,       // Allow spotlight to move off-screen
  offscreenMargin: 0.5       // Extra margin beyond screen edge (0.5 = half screen width/height)
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
  innerRadiusScale: 0.6       // Inner radius where effect is at maximum (0.0-1.0 of radiusScale)
};


// ========== TEXT SETTINGS (EASY TO ADJUST) ==========
const TEXT_SETTINGS = {
  fontSize: 3.6,                                      // Font size
  fontFamily: 'ITC Century Std Light.otf',         // Font family für Text
  lineSpacing: 1.1,                               // Line spacing multiplier (1.0 = no extra space, 1.5 = 50% extra)
  margin: 4,                                     // Margin from edges (in poster.vw units)
  highlightColor: [255, 255, 255],              // Color for highlighted text (weiss)
  defaultColor: [80, 80, 80],                  // Color for default text (grau)
  transitionDuration: 1000,                   // Animation Dauer
  slideDistance: 10,                         // Zeilen-Verschiebung x-Achse

  // Highlight Number Settings
  backgroundFontFamily: 'CenturyStd-Book.otf',   // Font family for the background number
  numberHeightScale: 0.21,                      // Size of the highlight number (0.9 = 90% of window height)
  numberColor: [255, 255, 255],                // Color of the highlight number (RGB: white)
  numberOpacity: 255,                         // Opacity of the highlight number (0-255)
  numberVerticalOffset: 10                  // Vertical offset in pixels (positive = down, negative = up)
};


let textContent = [
  "In 2025, the Museum für Gestaltung Zürich is celebrating the 150th anniversary of its founding. A banner year that presents the perfect occasion not only to take a look back at the history of the museum but also to examine current developments in the field of design and venture an outlook toward the future. A variety program of exhibitions and activities will take place throughout the anniversary year. One highlight is the grand opening in mid-April of the new permanent exhibition Swiss Design Collection at the Toni-Areal, accompanied by a whole weekend of festivities. In recent years, the Museum für Gestaltung Zürich has further strengthened its position as a leading museum of design and visual communication. With innovative exhibitions and interactive formats, it attracts a wide audience, promoting an ongoing dialogue on the latest trends and social issues in design. The museum explores design in all its diversity, presenting outstanding works to the public while also addressing today's digital transformation and fostering exchange and networking within the global design community. The museum places special emphasis on inclusion and sustainability and is committed to making its exhibitions and activities as broadly accessible and resource-efficient as possible. The diverse program is geared toward people of varied age groups and cultural backgrounds. In an effort to appeal to a broad international audience, the museum offers information and guided tours in several languages as well as simple German. On our 150th anniversary, we respectfully remember our past while looking confidently to the future. We want to continue to serve as a platform for innovative exhibitions, for safeguarding and preserving outstanding works, and for creative exchange. Our program endeavors to convey the enormous importance of design in a fun and exciting way so that as many people as possible can be inspired by good design, says Christian Brändle, director of the museum. The year kicks off with a special program at the museum's Ausstellungsstrasse location. The admission-free exhibition Jakob Kudsk Steensen: Berl-Berl turns the lecture hall into an immersive installation that will continually be reconfigured in real time by dedicated game engines. The unique 1933 building will be additionally enlivened in January by a range of activities for young and old, including behind-the-scenes architecture tours, design talks, workshops, one-off sales, a bar, a screen-printing studio, game events, and musical performances. Following this multifaceted prelude to the anniversary year, the new permanent exhibition Swiss Design Collection will open at the Toni-Areal in April. The exhibition presents highlights from the fields of graphic design, posters, the decorative arts, and industrial design that shed light on the collection from diverse and unexpected perspectives while also making parts of the archives accessible to the public for the first time. Visitors will be invited to exercise their own creativity based on various themes and using a number of different techniques. The exhibition opening on April 11 will mark the start of an anniversary weekend featuring free admission to both the new Swiss Design Collection presentation and the other exhibitions on view at the Toni-Areal and Ausstellungsstrasse locations. In July, the museum will then extend its reach into the public space with an exhibition by the lake devoted to 150 years of poster culture. Historical as well as contemporary examples will illustrate the development of poster art and its significance for visual communication. Viewers can look forward to embarking on a visual journey through the decades as they learn how posters still serve today as a mirror of society and a medium for artistic expression. The exploratory exhibition Museum of the Future – 17 Digital Experiments, which opens in August on Ausstellungsstrasse, takes a fascinating peek at the world of tomorrow, showing how digitalization and artificial intelligence are radically expanding what can be presented at the museum. Guests will have a chance to interact with digital artworks that blur the boundaries between physical and virtual reality. In the fall, the exhibition Young Graphic Design Switzerland! will look at contemporary work and how the youngest generation is shaping the graphic design landscape of tomorrow. Last but not least, the museum is putting together a show of the highs and lows from 150 years of posters advertising its own exhibitions. The Museum für Gestaltung Zürich looks back on an eventful history dating back to 1875, when it was founded as the City of Zurich's museum of applied arts. From 1898, the collection was housed in the National Museum. In 1933, the museum and the School of Arts and Crafts, founded 1878 and today known as Zurich University of the Arts (ZHdK), then relocated to the striking building on Ausstellungsstrasse, an outstanding example of New Building in Switzerland. From 1968 to 2014, the museum ran the Museum Bellerive on Lake Zurich, with a focus on decorative arts. In 2014, new exhibition spaces were opened on the new ZHdK campus in the Toni-Areal in Zurich-West, bringing together all four of the museum's collections and their 580,000 objects under one roof. Following extensive renovations, the original museum location on Ausstellungsstrasse was officially reopened in March 2018. Since May 2019, the museum has also been operating the Pavillon Le Corbusier for the public on behalf of the City of Zurich. Throughout the anniversary year, admission will be free on Thursday evenings from 5:00 to 8:00pm. In addition, starting with the opening of the new permanent exhibition Swiss Design Collection, visitors will be able to visit all three museum locations – Ausstellungsstrasse, the Toni-Areal, and the Pavillon Le Corbusier – with a new combined ticket. Admission is now free for young adults under the age of 20. The museum's collections represent an unparalleled treasure trove of design history, spanning centuries of creative innovation. From early examples of Swiss typography to contemporary digital design, the archives contain works by some of the most influential designers of their respective eras. The poster collection alone, with over 350,000 items, is one of the largest and most comprehensive in the world, documenting the evolution of visual communication from the late 19th century to the present day. Iconic works by designers such as Josef Müller-Brockmann, Emil Ruder, and Armin Hofmann form the backbone of what is known internationally as the Swiss Style, a design movement that emphasized clarity, readability, and objective communication. These pioneering designers worked closely with the museum and the School of Arts and Crafts, creating a symbiotic relationship between education, practice, and cultural preservation that continues to this day. The collection also includes significant holdings in product design, furniture, textiles, ceramics, and jewelry, reflecting the breadth of applied arts and industrial design. Notable pieces include early modernist furniture by Le Corbusier, Charlotte Perriand, and Marcel Breuer, as well as innovative product designs from the mid-20th century that transformed everyday life. The textile collection features everything from historical samples of Swiss embroidery and weaving to experimental fabric designs from contemporary artists pushing the boundaries of material innovation. Throughout its history, the museum has been committed to making design accessible and understandable to the broader public. Educational programs for schools, families, and adult learners have been a cornerstone of the museum's mission, helping to cultivate visual literacy and an appreciation for good design across generations. Workshops, lectures, and guided tours provide opportunities for visitors to engage more deeply with the exhibitions and to develop their own creative skills. The museum's library and study center serve as important resources for researchers, students, and design professionals, offering access to an extensive collection of books, periodicals, and archival materials related to design history and theory. The anniversary year provides a unique opportunity to reflect on the evolving role of design in society and to consider how museums can remain relevant in an increasingly digital world. The exhibition Museum of the Future – 17 Digital Experiments directly addresses these questions by showcasing innovative approaches to curation, display, and visitor engagement. From virtual reality experiences to AI-generated exhibitions, these experiments explore how technology can enhance rather than replace the physical museum experience. Interactive installations allow visitors to participate in the creative process, while digital archives make it possible to explore the full breadth of the collection in ways that would be impossible in a traditional exhibition setting. The museum has also embraced social media and digital platforms as tools for reaching new audiences and fostering dialogue around design issues. Online exhibitions, virtual tours, and digital workshops have expanded the museum's reach far beyond the borders of Zurich, connecting with design enthusiasts and professionals around the globe. This digital engagement complements rather than competes with the physical museum experience, offering multiple entry points for people to connect with design culture. As we look toward the future, the Museum für Gestaltung Zürich remains committed to its founding mission of promoting excellence in design and making it accessible to all. The challenges facing the world today – from climate change to social inequality to rapid technological transformation – require innovative design solutions, and museums have an important role to play in fostering the creative thinking and visual literacy needed to address these challenges. By preserving and presenting the best examples of design from the past, while also championing experimental and forward-thinking work, the museum helps to inspire the next generation of designers and design-conscious citizens. The anniversary celebrations will culminate in a major symposium bringing together leading designers, curators, educators, and theorists from around the world to discuss the future of design museums and the role of design in shaping a more sustainable and equitable future. This gathering will provide an opportunity to share best practices, explore new models for museum programming and collection development, and to strengthen international networks within the design community. The insights and connections generated through this symposium will help guide the museum's strategic direction for the next chapter of its history. In addition to the exhibitions and events taking place at the museum's three locations, the anniversary year will see numerous collaborations with other cultural institutions, educational organizations, and community groups throughout Zurich and beyond. These partnerships reflect the museum's commitment to being an active participant in the cultural life of the city and to making design a part of everyday conversation. Pop-up exhibitions, design interventions in public spaces, and collaborative projects with local schools and community centers will bring design to new audiences and demonstrate its relevance to daily life. The Museum für Gestaltung Zürich has always been more than just a repository for beautiful objects. It is a living institution that actively shapes design discourse and practice through its exhibitions, publications, and educational programs. The museum's staff includes curators, conservators, educators, and researchers who are experts in their respective fields and who contribute to international scholarship on design history and theory. Their work ensures that the collection is not only preserved for future generations but also studied, interpreted, and made relevant to contemporary concerns. The anniversary year is also an opportunity to recognize the many individuals who have contributed to the museum's success over the past 150 years. From the visionary founders who established the institution to the dedicated staff members who have worked behind the scenes to care for the collection, countless people have played a role in building the museum into what it is today. Special recognition is due to the donors, sponsors, and supporters who have provided crucial financial backing and whose generosity has made possible many of the museum's most ambitious projects. Their continued support will be essential as the museum embarks on its next 150 years. As part of the anniversary celebrations, the museum is launching several new initiatives designed to ensure its long-term sustainability and continued relevance. These include an expanded membership program offering exclusive benefits and behind-the-scenes access, a new fellowship program for emerging curators and researchers, and enhanced conservation facilities to ensure the proper care of the collection for future generations. The museum is also exploring innovative funding models and partnerships that will provide financial stability while maintaining its commitment to accessibility and public service. Looking back over 150 years of history, it is remarkable to see how the Museum für Gestaltung Zürich has evolved and adapted to changing times while remaining true to its core mission. From its origins as a teaching collection supporting the applied arts to its current status as an internationally recognized institution at the forefront of design discourse, the museum has consistently demonstrated the ability to innovate and respond to new challenges. As we celebrate this milestone, we also look forward with excitement and confidence to the future, knowing that design will continue to play a crucial role in shaping our world and that the Museum für Gestaltung Zürich will continue to be a leader in promoting and preserving design excellence for generations to come."
];

let words = [];
let numberGraphics;
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
  createCanvas(100, 100);

  // Spotlight mask buffer erstellen
  spotlightMask = createGraphics(width, height);

  // Initial spotlight position
  spotlightX = width / 2;
  spotlightY = height / 2;

  layoutText();
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

// Berechne GIF-Dimensionen basierend auf fitMode
function getGifDimensions() {
  let imgW, imgH, imgX, imgY;

  if (BG_SETTINGS.fitMode === 'cover') {
    let canvasRatio = width / height;
    let imgRatio = backgroundGif.width / backgroundGif.height;

    if (canvasRatio > imgRatio) {
      imgW = width;
      imgH = width / imgRatio;
    } else {
      imgH = height;
      imgW = height * imgRatio;
    }
    imgX = (width - imgW) / 2;
    imgY = (height - imgH) / 2;

  } else if (BG_SETTINGS.fitMode === 'contain') {
    let canvasRatio = width / height;
    let imgRatio = backgroundGif.width / backgroundGif.height;

    if (canvasRatio > imgRatio) {
      imgH = height;
      imgW = height * imgRatio;
    } else {
      imgW = width;
      imgH = width / imgRatio;
    }
    imgX = (width - imgW) / 2;
    imgY = (height - imgH) / 2;

  } else {
    imgX = 0;
    imgY = 0;
    imgW = width;
    imgH = height;
  }

  return { imgX, imgY, imgW, imgH };
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
  if (!BG_SETTINGS.enabled || !backgroundGif) return;

  let dims = getGifDimensions();

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

  // 1. Basis-GIF mit niedriger Opacity zeichnen
  push();
  tint(BG_SETTINGS.tint[0], BG_SETTINGS.tint[1], BG_SETTINGS.tint[2], BG_SETTINGS.opacity);
  image(backgroundGif, dims.imgX, dims.imgY, dims.imgW, dims.imgH);
  pop();

  // 2. Spotlight-Overlay mit höherer Opacity
  if (SPOTLIGHT_SETTINGS.enabled) {
    let spotRadius = height * SPOTLIGHT_SETTINGS.radius;
    let innerRadius = spotRadius * (1 - SPOTLIGHT_SETTINGS.softness);

    // Spotlight mask erstellen mit radialem Gradient
    spotlightMask.clear();

    // Radialer Gradient für weichen Spotlight-Effekt
    let steps = 30;
    spotlightMask.noStroke();

    for (let i = steps; i >= 0; i--) {
      let t = i / steps;
      let r = lerp(innerRadius, spotRadius, t);

      // Opacity fällt von innen nach aussen ab
      let alpha = map(i, 0, steps, 255, 0);
      // Smooth falloff
      alpha = alpha * (1 - t * t);

      spotlightMask.fill(255, 255, 255, alpha);
      spotlightMask.ellipse(spotlightX, spotlightY, r * 2, r * 2);
    }

    // GIF mit Spotlight-Opacity zeichnen, maskiert durch den Gradient
    push();

    // Blend mode für additives Overlay
    drawingContext.save();

    // Temporärer Canvas für maskiertes GIF
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    let tempCtx = tempCanvas.getContext('2d');

    // GIF auf temp canvas zeichnen
    tempCtx.drawImage(backgroundGif.canvas || backgroundGif.elt,
      dims.imgX, dims.imgY, dims.imgW, dims.imgH);

    // Maske als composite operation anwenden
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.drawImage(spotlightMask.canvas || spotlightMask.elt, 0, 0);

    // Extra Opacity für den Spotlight-Bereich
    let extraOpacity = SPOTLIGHT_SETTINGS.maxOpacity - BG_SETTINGS.opacity;
    drawingContext.globalAlpha = extraOpacity / 255;

    // Tint anwenden
    tint(BG_SETTINGS.tint[0], BG_SETTINGS.tint[1], BG_SETTINGS.tint[2]);

    // Maskiertes Bild zeichnen
    drawingContext.drawImage(tempCanvas, 0, 0);

    drawingContext.restore();
    pop();
  }
}

function draw() {
  background(10, 10, 10);

  // Hintergrund-GIF mit Spotlight zeichnen
  drawBackgroundGif();

  // Only create graphics buffer when counter changes
  let currentCounter = poster.getCounter();
  if (currentCounter !== lastCounter) {
    lineSlideParams = buildLineParams();

    // altes Graphics fuer Transition merken
    if (numberGraphics) {
      if (oldNumberGraphics) {
        oldNumberGraphics.remove();
      }
      oldNumberGraphics = numberGraphics;
    }

    // Neues Graphics fuer die Zahl
    numberGraphics = createGraphics(width, height);
    numberGraphics.pixelDensity(1); // macht das Sampling stabiler
    numberGraphics.textFont(backgroundFont);

    // Referenzgroesse fuer Messung
    let refSize = 100;
    //numberGraphics.textSize(refSize);
    let asc = numberGraphics.textAscent();
    let desc = numberGraphics.textDescent();
    let totalRefHeight = asc + desc;

    // Zielhoehe: aus Settings
    //let targetHeight = height * TEXT_SETTINGS.numberHeightScale;
    // let scale = targetHeight / totalRefHeight;
    //let numberSize = refSize * scale;
    let numberSize = height * 0.9;
    // endgueltige Groesse setzen
    numberGraphics.textSize(numberSize);

    // jetzt noch einmal messen (nicht zwingend noetig, aber sauber)
    asc = numberGraphics.textAscent();
    desc = numberGraphics.textDescent();

    // Zahl zentriert in der Mitte des Offscreen-Canvas zeichnen (mit vertikalem Offset)
    numberGraphics.clear();                     // transparenter Hintergrund
    numberGraphics.textAlign(CENTER, CENTER);   // horizontal + vertikal zentriert
    numberGraphics.fill(TEXT_SETTINGS.numberColor[0], TEXT_SETTINGS.numberColor[1], TEXT_SETTINGS.numberColor[2], TEXT_SETTINGS.numberOpacity);
    numberGraphics.text(currentCounter.toString(), width / 2, height / 2 + TEXT_SETTINGS.numberVerticalOffset);

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
      oldNumberGraphics.remove();
      oldNumberGraphics = null;
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

    color = [
      lerp(TEXT_SETTINGS.defaultColor[0], targetHighlightColor[0], totalColorStrength),
      lerp(TEXT_SETTINGS.defaultColor[1], targetHighlightColor[1], totalColorStrength),
      lerp(TEXT_SETTINGS.defaultColor[2], targetHighlightColor[2], totalColorStrength)
    ];

    // Apply opacity (only affects attraction, not number highlight)
    let finalOpacity = numberStrength > 0 ? 255 : attractOpacity * 255;

    fill(color[0], color[1], color[2], finalOpacity);
    text(word.text, word.x + totalOffsetX, word.y + totalOffsetY);
    //console.log(word.text);
  });
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function checkOverlapPrecise(word, pg, offsetX = 0, offsetY = 0, textOffsetX = 0) {
  if (!pg) return false;

  let wordHeight = TEXT_SETTINGS.fontSize * poster.vw;
  let samples = 3;
  for (let i = 0; i < samples; i++) {
    let sampleX = word.x + textOffsetX + (word.w * i / (samples - 1)) - offsetX;
    let sampleY = word.y - wordHeight / 2 - offsetY;
    for (let j = 0; j < 2; j++) {
      let checkY = sampleY + (wordHeight * j);
      if (sampleX >= 0 && sampleX < width && checkY >= 0 && checkY < height) {
        let px = pg.get(sampleX, checkY);
        if (px[0] > 128) {
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
  spotlightMask.resizeCanvas(width, height);

  layoutText();
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