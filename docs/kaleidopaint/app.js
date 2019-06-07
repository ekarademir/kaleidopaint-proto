
/**
 * Constants
 */
const HEIGHT_CORRECTION = 100; // Pixels

const SIZE_PICKER_MIN = 1;  // Pixels
const SIZE_PICKER_MAX = 25;  // Pixels
const SIZE_PICKER_STEP = 1;  // Pixels
const SIZE_PICKER_DEFAULT = 5;  // Pixels

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
        brushSize: 'size',
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
    sizePicker.addClass('slider');
    repeatPicker = createSlider(
        REPEAT_PICKER_MIN, REPEAT_PICKER_MAX,
        REPEAT_PICKER_DEFAULT, REPEAT_PICKER_STEP
    );
    repeatPicker.addClass('slider');

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
    strokeWeight(1);
    noFill(); stroke(color(CENTER_CURSOR_COLOR));
    circle(centerX , centerY, CENTER_CURSOR_RADIUS);
}

function drawCursors() {
    for (let i = 0; i < cursorGliphs.length; ++i) {
        let c = cursors[i];
        cursorGliphs[i].setAttribute('cx', `${c.x}`);
        cursorGliphs[i].setAttribute('cy', `${c.y}`);
    }
}

function updateCursors() {
    let centerPoint = createVector(windowWidth / 2, windowHeight / 2);
    let mousePointer = createVector(mouseX, mouseY);
    let distanceVector = p5.Vector.sub(mousePointer, centerPoint);
    const dDeg = 2 * PI / numCursors;
    cursors = [];

    for (let i = 0; i < numCursors; ++i) {
        cursors.push(
            p5.Vector.add(centerPoint, distanceVector.rotate(dDeg * i))
        );
    }
}

function makeCursor() {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('fill', brushColor);
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
    const centerPoint = createVector(windowWidth / 2, windowHeight / 2);
    const dFrom = p5.Vector.sub(from, centerPoint);
    const dTo = p5.Vector.sub(to, centerPoint);

    stroke(color(brushColor));
    strokeWeight(cursorSize);
    let dDeg = 2 * PI / numCursors;

    for (let i = 0; i < cursors.length; ++i) {
        const f = p5.Vector.add(centerPoint, dFrom.rotate(dDeg * i));
        const t = p5.Vector.add(centerPoint, dTo.rotate(dDeg * i));

        line(f.x, f.y, t.x, t.y);
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

let points = [];

function exhoustPoints() {
    if (points.length > 2) {
        brushStroke(
            points.shift(),
            points[0]
        )
    }
    setTimeout(exhoustPoints, 0);
}

function touchStarted() {
    points.push(createVector(mouseX, mouseY));
}

function touchEnded() {
    points = [];
    // Stuff related to keeping a copy of the last version of the image for undo
}

function touchMoved() {
    points.push(createVector(mouseX, mouseY));
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

    smooth();
    frameRate(30);
    density = displayDensity();
    console.log(`Pixel density: ${density}`);
    mainCanvas = createCanvas(windowWidth, correctHeight());
    pixelDensity(density);
    mainCanvas.parent(DRAW_AREA);
    updateCanvas();
    updateCursors();
    updateCursorGliphs();
    setTimeout(exhoustPoints, 0);
}

function draw() {
    drawCenterSpot();
    updateCursors();
    drawCursors();
}
