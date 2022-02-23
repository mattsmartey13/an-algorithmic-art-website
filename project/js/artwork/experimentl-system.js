let mouse = {x: 0, y: 0};
let lSystemString = "";
let fractal = {
    angle: 0,
    startAngle: 0,
    currentAngle: 0,
    lineLength: 0,
    iterations: 1,
    multiplier: 1
}

let currentPoint = {
    'x': mouse.x,
    'y': mouse.y,
    'degrees': 0
}

let stashPoint = {
    'x': 0, 
    'y': 0, 
    'degrees': 0
};

let finalPoint = {
    'x': 0, 
    'y': 0, 
    'degrees': 0
};

function lSystemCanvasOnMouseOver(event) {
    const canvas = document.getElementById('experimentLSystemCanvas');
    const coordinates = canvasOnMouseOver(canvas, event);
    $("#mouseFloatX").html("X: " + coordinates.x);
    $("#mouseFloatY").html("Y: " + coordinates.y);
}

function lSystemCanvasOnClick(event) {
    const canvas = document.getElementById('experimentLSystemCanvas');
    canvasOnMouseClick(canvas, event, currentPoint, mouse);
    $("#mouseX").html("X: " + mouse.x);
    $("#mouseY").html("Y: " + mouse.y);
}

function drawLSystemLine(startX, startY, degrees, fractal) {
    const canvas = document.getElementById('experimentLSystemCanvas');
    const context = canvas.getContext('2d');
    if (validateAngle(degrees)) {
        const theta = degreeToRadian(degrees);
        const endPoints = getEndpoints(startX, startY, fractal.lineLength, theta)
        drawGenericLine(context, startX, startY, getRandomColour(), fractal.lineLength / 5, endPoints.endX, endPoints.endY);

        currentPoint.x = endPoints.endX;
        currentPoint.y = endPoints.endY;
    }
}

function iterateOverRule(canvas, rule, currentPoint, stashPoint) {
    const rules = {
        A: $("#ruleA").val(),
        B: $("#ruleB").val()
    }

    for (let char of rule) {
        if (char === "A") {
            processRule(canvas, currentPoint, stashPoint, rules.A, fractal);
        } else if (char === "B") {
            processRule(canvas, currentPoint, stashPoint, rules.B, fractal);
        }
    }
}

function processRule(canvas, currentPoint, stashPoint, rule, fractal) {
    for (let character of rule) {
        parseInt(currentPoint.degrees);
        switch (character) {
            case 'F':
                drawLSystemLine(currentPoint.x, currentPoint.y, currentPoint.degrees, fractal);
                break;
            case '+':
                rotatePointDirection(true, fractal.angle, currentPoint);
                break;
            case'-':
                rotatePointDirection(false, fractal.angle, currentPoint);
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

function drawFractal() {
    lSystemString = "";
    returnAxiom();
    const canvas = document.getElementById("experimentLSystemCanvas");
    const ruleA = $("#ruleA").val();
    const ruleB = $("#ruleB").val();
    const ruleABecomes = $("#ruleABecomes").val();
    const ruleBBecomes = $("#ruleBBecomes").val();

    fractal.angle = parseInt($("#angle").val());
    fractal.startAngle = parseInt($("#startAngle").val());
    fractal.lineLength = parseInt($("#lineLength").val());
    fractal.iterations = parseInt($("#iterations").val());
    fractal.multiplier = parseFloat($("#multiplier").val());

    if (validateInputs(ruleABecomes, ruleBBecomes, ruleA, ruleB, fractal)) {
        if (currentPoint.x === mouse.x && currentPoint.y === mouse.y) {
            currentPoint.degrees = fractal.startAngle;
        } else {
            currentPoint.degrees = finalPoint.degrees;
            currentPoint.x = finalPoint.x;
            currentPoint.y = finalPoint.y;
        }
        lSystemGenerate(canvas, lSystemString, fractal);

        finalPoint.x = currentPoint.x;
        finalPoint.y = currentPoint.y;
        finalPoint.degrees = currentPoint.degrees;
    }
}

function resetCanvas() {
    const canvas = document.getElementById('experimentLSystemCanvas');
    const context = canvas.getContext('2d');
    currentPoint.x = mouse.x;
    currentPoint.y = mouse.y;
    finalPoint.x = 0;
    finalPoint.y = 0;
    finalPoint.degrees = 0;
    currentPoint.degrees = 0
    fractal.lineLength = parseInt($("#lineLength").val());
    lSystemString = "";

    context.clearRect(0, 0, canvas.width, canvas.height);
}

function returnAxiom() {
    if ($("#ruleARadio").prop("checked")) {
        lSystemString = "A"
        return lSystemString;
    } else if ($("#ruleBRadio").prop("checked")) {
        lSystemString = "B";
        return lSystemString;
    } else {
        return undefined;
    }
}

function lSystemCompute(string) {
    const ruleABecomes = $("#ruleABecomes").val();
    const ruleBBecomes = $("#ruleBBecomes").val();
    let newString = "";
    for (let character of string) {
        if (character === "A") {
            newString += ruleABecomes;
        } else if (character === "B") {
            newString += ruleBBecomes;
        }
    }
    return newString;
}

function lSystemGenerate(canvas, string, fractal) {
    for (let iter = 0; iter < fractal.iterations; iter++) {
        string = lSystemCompute(string);
        iterateOverRule(canvas, string, currentPoint, stashPoint);
        fractal.lineLength *= fractal.multiplier;
    }
}

function errorFinder() {
    let error = "";
    const errorMessage = document.getElementById('l-systemerrormsg');
    const startAngle = parseInt($("#startAngle").val());
    const rotationAngle = parseInt($("#angle").val());
    const lineLength = parseInt($("#lineLength").val());
    const ruleA = $("#ruleA").val();
    const ruleB = $("#ruleB").val();
    const ruleABecomes = $("#ruleABecomes").val();
    const ruleBBecomes = $("#ruleBBecomes").val();
    const multiplier = $("#multiplier").val();
    try {
        if (!validateAngle(startAngle)) {
            error += `<br> ${startAngle} is not within the 0-360 bounds for the starting angle.`
        }
        if (!validateAngle(rotationAngle)) {
            error += `<br> ${rotationAngle} is not within the 0-360 bounds for the rotational angle.`
        }
        if (returnAxiom() === undefined) {
            error += `<br> You need to select an axiom to kickstart your drawing.`
        }
        if (!testRuleCharacters(ruleA, ruleB)) {
            error += `<br> You need to specify what rule A and B are in terms of F, + or - with no spaces.`
        }
        if (!testRegex(ruleABecomes, ruleBBecomes)) {
            error += `<br> Recursive rule calling needs to be defined in terms of A or B with no spaces.`
        }
        if (!validateLineLength(lineLength)) {
            error += `<br> You cannot draw a fractal with a line length of 0 or below!`
        }
        if (mouse.x === 0 && mouse.y === 0) {
            error += `<br> Please click on the canvas to initialise a point.`
        }
        if (!validateMultiplier(multiplier)) {
            error += `<br> THe multiplier has to be below 2 and larger than 0.1.`
        }
        throw Error(error);
    } catch {
        errorMessage.innerHTML = error;
    }
}

function onInputChange() {
    let errorMessage = document.getElementById('l-systemerrormsg');
    errorMessage.innerHTML = "";
}

function validateMultiplier(multiplier) {
    return multiplier <= 2 && multiplier > 0;
}

function validateInputs(ruleABecomes, ruleBBecomes, ruleA, ruleB, fractal) {
    return !!(testRegex(ruleABecomes, ruleBBecomes) &&
        testRuleCharacters(ruleA, ruleB) &&
        validateAngle(fractal.angle) &&
        validateAngle(fractal.startAngle) &&
        validateMultiplier(fractal.multiplier) &&
        validateLineLength(fractal.lineLength) === true);
}







