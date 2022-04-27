const fractalProperties = {
    angle: 0,
    startAngle: 0,
    currentAngle: 0,
    lineLength: 0,
    iterations: 1,
    multiplier: 1
}

const mouse = {
    'x': 0,
    'y': 0
};

const currentPoint = {
    'x': 0,
    'y': 0,
    'degrees': 0
}

const stashPoint = {
    'x': 0, 
    'y': 0, 
    'degrees': 0
};

/**
 * Mouseover for fractal canvas
 * @param event
 */
function fractalCanvasOnMouseOver(event) {
    const canvas = document.getElementById('fractalLSystemCanvas');
    const coordinates = canvasOnMouseOver(canvas, event);
    $("#fractalMouseFloat").html(`X: ${coordinates.x}, Y: ${coordinates.y}`);
}

/**
 * Mousedown for fractal canvas
 * @param event
 */
function fractalCanvasOnClick(event) {
    const canvas = document.getElementById('fractalLSystemCanvas');
    canvasOnMouseClick(canvas, event, currentPoint, mouse);
    $("#fractalMouse").html(`X: ${mouse.x}, Y: ${mouse.y}`);
}

/**
 * Draw line within fractal - called when "F" is the current string character
 * @param startX
 * @param startY
 * @param degrees
 * @param fractalProperties
 */
function drawFractalLine(startX, startY, degrees, fractalProperties) {
    const canvas = document.getElementById('fractalLSystemCanvas');
    const context = canvas.getContext('2d');
    const theta = degreeToRadian(degrees);
    const endPoints = getEndpoints(startX, startY, fractalProperties.lineLength, theta)

    drawGenericLine(context, startX, startY, getRandomColour(), fractalProperties.lineLength / 5, endPoints.x, endPoints.y);

    currentPoint.x = endPoints.x;
    currentPoint.y = endPoints.y;
}

/**
 * This iterates over the A&B based final string, will carry out the instructions associated with A and B
 * @param canvas
 * @param string
 * @param currentPoint
 * @param stashPoint
 */
function iterateOverFractalRule(canvas, string, currentPoint, stashPoint) {
    const rules = {
        A: $("#ruleA").val(),
        B: $("#ruleB").val()
    }

    for (let char of string) {
        if (char === "A") {
            processFractalRule(canvas, currentPoint, stashPoint, rules.A, fractalProperties);
        } else if (char === "B") {
            processFractalRule(canvas, currentPoint, stashPoint, rules.B, fractalProperties);
        }
    }
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
        parseInt(currentPoint.degrees);
        if (validateAngle(currentPoint.degrees)) {
            switch (character) {
                case 'F':
                    drawFractalLine(currentPoint.x, currentPoint.y, currentPoint.degrees, fractalProperties);
                    break;
                case '+':
                    rotatePointDirection(true, fractalProperties.angle, currentPoint);
                    break;
                case'-':
                    rotatePointDirection(false, fractalProperties.angle, currentPoint);
                    break;
                case '[':
                    setPointFromPoint(stashPoint, currentPoint.x, currentPoint.y, currentPoint.degrees);
                    break;
                case ']':
                    setPointFromPoint(currentPoint, stashPoint.x, stashPoint.y, stashPoint.degrees);
                    break;
            }
        }
    }
}

/**
 * Called when the user presses draw
 */
function drawFractal() {
    const canvas = document.getElementById("fractalLSystemCanvas");
    let lSystemString = returnAxiom();
    setFractalProperties(fractalProperties);

    if (!isMouseNil(mouse))
        try {
            generateFractalSymbolRule(canvas, lSystemString, fractalProperties);
        } catch {
            runFractalErrorChecker();
        }
    else
        alert(`Please click on the canvas to initialise a point.`)
}

/**
 * Processes changes by the user on the input elements and assigns them to the fractal properties object fields
 * @param fractalProperties
 */
function setFractalProperties(fractalProperties) {
    fractalProperties.angle = parseInt($("#angle").val());
    fractalProperties.startAngle = parseInt($("#startAngle").val());
    fractalProperties.lineLength = parseInt($("#lineLength").val());
    fractalProperties.iterations = parseInt($("#iterations").val());
    fractalProperties.multiplier = parseFloat($("#multiplier").val());
}

/**
 * Resets the fractal canvas, current point goes back to the last clicked mouse coordinates.
 */
function resetFractalCanvas() {
    const canvas = document.getElementById('fractalLSystemCanvas');
    const context = canvas.getContext('2d');
    fractalProperties.lineLength = parseInt($("#lineLength").val());
    currentPoint.x = mouse.x;
    currentPoint.y = mouse.y;
    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Gets the selected radio element, undefined if none selected
 * @returns {*|jQuery|undefined}
 */
function returnAxiom() {
    if ($("input[type='radio'].ruleRadioGroup").is(':checked')) {
        return $("input[type='radio'].ruleRadioGroup:checked").val();
    } else {
        return undefined;
    }
}

/**
 * This takes the current A or B value in the string, and concatenates to the back of the string what A and B calls.
 * If A calls ABBA, this will return AABBA, and so forth
 * @param string
 * @param ruleABecomes
 * @param ruleBBecomes
 * @returns {*}
 */
function computeFractalString(string, ruleABecomes, ruleBBecomes) {
    let newString = string;
    for (let character of string) {
        if (character === "A") {
            newString += ruleABecomes;
        } else if (character === "B") {
            newString += ruleBBecomes;
        }
    }
    return newString;
}

/**
 * Where iteration mechanism comes in, the larger the iteration number, the larger the ABABA string, the more complex the final shape drawn.
 * @param canvas
 * @param string
 * @param fractalProperties
 */
function generateFractalSymbolRule(canvas, string, fractalProperties) {
    const ruleABecomes = $("#ruleABecomes").val();
    const ruleBBecomes = $("#ruleBBecomes").val();
    for (let iter = 0; iter < fractalProperties.iterations; iter++) {
        string = computeFractalString(string, ruleABecomes, ruleBBecomes);
        iterateOverFractalRule(canvas, string, currentPoint, stashPoint);
        fractalProperties.lineLength *= fractalProperties.multiplier;
    }
}

/**
 * Returns alerts based on inputs that are not completed or filled in correctly.
 */
function runFractalErrorChecker() {
    const ruleA = $("#ruleA").val();
    const ruleB = $("#ruleB").val();
    const ruleABecomes = $("#ruleABecomes").val();
    const ruleBBecomes = $("#ruleBBecomes").val();

    try {
        if (returnAxiom() === undefined)
            throw(`You need to select an axiom to kickstart your drawing.`);
        if (!testRuleCharacters(ruleA, ruleB))
            throw(`You need to specify what rule A and B are in terms of F, + or - (with no spaces).`);
        if (!testRegex(ruleABecomes, ruleBBecomes))
            throw(`Recursive rule calling needs to be defined in terms of A or B (with no spaces).`);
    } catch(error) {
        alert(`Error: ${error}`);
    }
}







