
/**
 * Constants
 */
const HEIGHT_CORRECTION = 30; // Pixels

const SIZE_PICKER_MIN = 5;  // Pixels
const SIZE_PICKER_MAX = 50;  // Pixels
const SIZE_PICKER_STEP = 5;  // Pixels
const SIZE_PICKER_DEFAULT = 10;  // Pixels

const COLOR_PICKER_DEFAULT = 'purple';

const REPEAT_PICKER_MIN = 1;
const REPEAT_PICKER_MAX = 10;
const REPEAT_PICKER_STEP = 1;
const REPEAT_PICKER_DEFAULT = 4;

const CENTER_CURSOR_RADIUS = 10;  // Pixels
const CENTER_CURSOR_COLOR = 100;  // Grayscale value


/**
 * Global references
 */
var colorPicker;
var sizePicker;
var repeatPicker;
var mainCanvas;

var numCursors = REPEAT_PICKER_DEFAULT;
var cursorGliphs = [];
var cursors = [];
var svgCanvas;
var debugText;
var density;
var cursorSize = SIZE_PICKER_DEFAULT;
var brushColor = COLOR_PICKER_DEFAULT;

var lastCoords;  // Holds the previous location of the touch coordinates to draw from, to the new coordinate.

/**
 * Text
 */
const translations = {
    en: {
        brushSize: 'brush size',
        repeatNum: 'repeat'
    }
}

/**
 * HTML IDs
 * ties element ids in index.html to parent elements in here.
 */
const USER_CONTROLS = 'userControls';
const DRAW_AREA = 'drawArea';

/**
 * Correct canvas height
 */
function correctHeight() {return windowHeight - HEIGHT_CORRECTION};

/**
 * Add user controls and labels to top band
 */
function createUserControls() {
    colorPicker = createColorPicker(color(COLOR_PICKER_DEFAULT));
    sizePicker = createSlider(
        SIZE_PICKER_MIN, SIZE_PICKER_MAX,
        SIZE_PICKER_DEFAULT, SIZE_PICKER_STEP
    );
    repeatPicker = createSlider(
        REPEAT_PICKER_MIN, REPEAT_PICKER_MAX,
        REPEAT_PICKER_DEFAULT, REPEAT_PICKER_STEP
    );

    repeatPicker.input(onRepeatSliderChange);
    sizePicker.input(onBrushSizeSliderChange);
    colorPicker.input(onColorChange);

    colorPicker.parent(USER_CONTROLS);
    (createSpan(translations.en.brushSize)).parent(USER_CONTROLS);
    sizePicker.parent(USER_CONTROLS);
    (createSpan(translations.en.repeatNum)).parent(USER_CONTROLS);
    repeatPicker.parent(USER_CONTROLS);
}

function updateCanvas() {
    const ch = correctHeight();
    console.log(`Window dimensions: ${windowWidth} x ${ch}`);
    resizeCanvas(windowWidth, ch);
    svgCanvas.setAttribute('viewBox', `0 0 ${windowWidth} ${ch}`)
}

function drawCenterSpot() {
    let centerX = windowWidth / 2;
    let centerY = windowHeight / 2;
    noFill(); stroke(color(CENTER_CURSOR_COLOR));
    circle(centerX , centerY, CENTER_CURSOR_RADIUS);
}

function drawCursors() {
    for (let i = 0; i < cursorGliphs.length; ++i) {
        let c = cursors[i];
        cursorGliphs[i].setAttribute('cx', `${c[0]}`);
        cursorGliphs[i].setAttribute('cy', `${c[1]}`);
    }
}

function updateCursors() {
    let centerX = windowWidth / 2;
    let centerY = windowHeight / 2;
    let x = mouseX;
    let y = mouseY;
    let d = dist(centerX, centerY, x, y);
    let deg = atan((y - centerY) / (x - centerX));
    if (x < centerX) {
        deg += PI;
    }
    // debugText.innerHTML = `Cursor degrees ${int(degrees(deg))}`;
    let dDeg = 2 * PI / numCursors;
    cursors = [];

    for (let i = 0; i < numCursors; ++i) {
        let id = deg + dDeg * i;
        let ix = d * cos(id) + centerX;
        let iy = d * sin(id) + centerY;
        cursors.push([ix, iy]);
    }
}

function makeCursor() {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('fill', brushColor);
    // c.setAttribute('stroke', 'rgb(120,120,120)');
    // c.setAttribute('stroke-width', '2');
    c.setAttribute('r', `${cursorSize / density}`);

    return c;
}

function updateCursorGliphs() {
    for (let i = 0; i < cursorGliphs.length; ++i) {
        svgCanvas.removeChild(cursorGliphs[i]);
    }
    cursorGliphs = [];
    for (let i = 0; i < cursors.length; ++i) {
        let c = makeCursor();
        svgCanvas.appendChild(c);
        cursorGliphs.push(c);
    }
}

/**
 * Draw the definition of a brush stroke to the canvas.
 * @param {number[]} from Two element array to hold coordinate x and y
 * @param {number[]} to Two element array to hold coordinate x and y
 */
function brushStroke(from, to) {
    stroke(color(brushColor));
    strokeWeight(cursorSize);
    let dx = to[0] - from[0];
    let dy = to[1] - from[1];
    let d = Math.sqrt(
        Math.pow(to[0] - from[0], 2.0) + Math.pow(to[1] - from[1], 2.0)
    );

    let deg = atan(dy / dx);
    if (to[0] < 0) {
        deg += PI;
    }
    let dDeg = 2 * PI / numCursors;

    for (let i = 0; i < cursors.length; ++i) {
        let id = deg + dDeg * i;
        let ix = d * cos(id);
        let iy = d * sin(id);

        let c = cursors[i];
        line(c[0], c[1], c[0] + ix, c[1] + iy);
    }
}

/**
 * Event handlers
 */
function onWindowResize() {
    updateCanvas();
}
window.addEventListener('resize', onWindowResize);

function onRepeatSliderChange() {
    numCursors = repeatPicker.value();
    updateCursors();
    updateCursorGliphs();
}

function onBrushSizeSliderChange() {
    cursorSize = sizePicker.value();
    updateCursorGliphs();
}

function onColorChange() {
    brushColor = colorPicker.value();
    updateCursorGliphs();
}

/**
 * Stuff needed for drawing to canvas
 */
function touchStarted() {
    lastCoords = [mouseX, mouseY];
}

function touchEnded() {
    // Stuff related to keeping a copy of the last version of the image for undo
}

function touchMoved() {
    let newCoords = [mouseX, mouseY];
    brushStroke(lastCoords, newCoords);
    lastCoords = newCoords;
}

/**
 * ========= p5js stuff =======================
 */
function setup() {
    createUserControls();

    // Start canvas
    svgCanvas = document.getElementById('svgCanvas');
    debugText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    debugText.setAttribute('x', '10');
    debugText.setAttribute('y', '10');
    debugText.setAttribute('class', 'debug');
    svgCanvas.appendChild(debugText);

    density = displayDensity();
    console.log(`Pixel density: ${density}`);
    mainCanvas = createCanvas(windowWidth, correctHeight());
    pixelDensity(density);
    mainCanvas.parent(DRAW_AREA);
    updateCanvas();
    updateCursors();
    updateCursorGliphs();
}

function draw() {
    drawCenterSpot();
    updateCursors();
    drawCursors();
}
