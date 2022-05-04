const fractalCurrentPoint = {
    x: 0,
    y: 0,
    degrees: 0
}

const fractalMouse = {
    x: 0,
    y: 0,
}

function onFractalMouseOver(event) {
    const canvas = document.getElementById('fractalLSystemCanvas');
    const coordinates = canvasOnMouseOver(canvas, event);
    $('#fractalMouseFloatX').html(coordinates.x);
    $('#fractalMouseFloatY').html(coordinates.y);
}

function onFractalMouseClick(event) {
    const canvas = document.getElementById('fractalLSystemCanvas');
    canvasOnMouseClick(canvas, event, fractalCurrentPoint, fractalMouse);
    $("#fractalMouseX").html("X: " + fractalMouse.x);
    $("#fractalMouseY").html("Y: " + fractalMouse.y);
    drawCustomFractal();
}

/**
 * Draw line within fractal - called when "F" is the current string character
 * @param cp
 * @param fractalProperties
 */
function drawFractalLine(cp, fractalProperties) {
    const canvas = document.getElementById('fractalLSystemCanvas');
    const context = canvas.getContext('2d');
    const theta = degreeToRadian(cp.degrees);
    const endPoints = getEndpoints(cp.x, cp.y, fractalProperties.lineLength, theta)

    drawGenericLine(context, cp.x, cp.y, "#ffffff", fractalProperties.lineLength / 5, endPoints.x, endPoints.y);

    cp.x = endPoints.x;
    cp.y = endPoints.y;
}

/**
 * This interprets the F+-[] based rule that is defined as A or B by the user.
 * This contains the instructions to draw a line, rotate the point, save the point or go back to the saved point on the canvas.
 * @param canvas
 * @param currentPoint
 * @param stashPoint
 * @param rule
 * @param fractalProperties
 */
function processFractalRule(canvas, currentPoint, stashPoint, rule, fractalProperties) {
    for (let character of rule) {
        switch (character) {
            case 'F':
                drawFractalLine(currentPoint, fractalProperties);
                break;
            case '+':
                rotatePointDirection(true, fractalProperties.angle, currentPoint);
                break;
            case'-':
                rotatePointDirection(false, fractalProperties.angle, currentPoint);
                break;
        }
    }
}

/**
 * Called when the user presses draw
 */
function drawCustomFractal() {
    resetFractalCanvas();
    const canvas = document.getElementById("fractalLSystemCanvas");
    const fractalProperties = setFractalProperties();
    setCanvasColourGradient(canvas, "#C33764", "#1D2671")

    let string = $("#axiom").val();
    const alphabet = {
        axi: lSystemLanguage[0],
        plus: lSystemLanguage[1],
        minus: lSystemLanguage[2],
    }

    const currentPoint = fractalCurrentPoint;
    const stashPoint = currentPoint;

    for (let i = 0; i < fractalProperties.iterations; i++) {
        string = generateLSystem(string, alphabet);
        fractalProperties.lineLength *= 0.5;
    }

    processFractalRule(canvas, currentPoint, stashPoint, string, fractalProperties)
}

/**
 * Processes changes by the user on the input elements and assigns them to the fractal properties object fields
 */
function setFractalProperties() {
    return {
        angle: parseInt($("#angle").val()),
        iterations: parseInt($("#iterations").val()),
        lineLength: parseInt($("#lineLength").val()),
    };
}

/**
 * Resets the fractal canvas, current point goes back to the last clicked mouse coordinates.
 */
function resetFractalCanvas() {
    const canvas = document.getElementById('fractalLSystemCanvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}







