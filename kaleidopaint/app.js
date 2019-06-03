
/**
 * Global references
 */
var colorPicker;
var sizePicker;
var repeatPicker;
var mainCanvas;

/**
 * Constants
 */
const HEIGHT_CORRECTION = 30; // Pixels

const SIZE_PICKER_MIN = 5;  // Pixels
const SIZE_PICKER_MAX = 50;  // Pixels
const SIZE_PICKER_STEP = 5;  // Pixels
const SIZE_PICKER_DEFAULT = 5;  // Pixels

const COLOR_PICKER_DEFAULT = 'yellow';

const REPEAT_PICKER_MIN = 1;
const REPEAT_PICKER_MAX = 10;
const REPEAT_PICKER_STEP = 1;
const REPEAT_PICKER_DEFAULT = 3;

const CENTER_CURSOR_RADIUS = 10;  // Pixels
const CENTER_CURSOR_COLOR = 100;  // Grayscale value

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
    colorPicker.parent(USER_CONTROLS);
    (createSpan(translations.en.brushSize)).parent(USER_CONTROLS);
    sizePicker.parent(USER_CONTROLS);
    (createSpan(translations.en.repeatNum)).parent(USER_CONTROLS);
    repeatPicker.parent(USER_CONTROLS);
}

function updateCanvas() {
    console.log(`Window dimensions: ${windowWidth} x ${correctHeight()}`);
    resizeCanvas(windowWidth, correctHeight());
    updateCenterSpot();
}

function updateCenterSpot() {
    let centerX = windowWidth / 2;
    let centerY = windowHeight / 2;
    noFill(); stroke(color(CENTER_CURSOR_COLOR));
    circle(centerX , centerY, CENTER_CURSOR_RADIUS);
}

/**
 * ======== event handlers
 */
/**
 * Handles window resize
 */
function onWindowResize() {
    updateCanvas();
}
window.addEventListener('resize', onWindowResize);

/**
 * ========= p5js stuff =======================
 */
function setup() {
    createUserControls();

    // Start canvas
    let density = displayDensity();
    console.log(`Pixel density: ${density}`);
    mainCanvas = createCanvas(windowWidth, correctHeight());
    pixelDensity(density);
    mainCanvas.parent(DRAW_AREA);
    updateCanvas();
}

function draw() {
    // ellipse(50, 50, 80, 80);
}
