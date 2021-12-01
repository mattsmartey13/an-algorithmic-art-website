const language = /^[F+\-\[\]]*$/;
const regex = /^[a-bA-B]*$/

let mouse = {x: 0, y: 0};
let stashPoint = {x: 0, y: 0};
let finalPoint = {x: 0, y: 0};
let stashAngle = 0;
let finalAngle = 0;
let lSystemString = "";

let fractal = {
    angle: 0,
    startAngle: 0,
    currentAngle: 0,
    lineL: 0,
    iterations: 1,
}

let currentPoint = {
    'x': mouse.x,
    'y': mouse.y,
}

function lSystemCanvasOnMouseOver(event) {
    const canvas = document.getElementById('experimentLSystemCanvas');
    let rect = canvas.getBoundingClientRect();
    $("#mouseFloatX").html("X: " + Math.round((event.clientX - rect.left) / (rect.right - rect.left) * canvas.width));
    $("#mouseFloatY").html("Y: " + Math.round((event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height));
}

function lSystemCanvasOnClick(event) {
    const canvas = document.getElementById('experimentLSystemCanvas');
    let rect = canvas.getBoundingClientRect();
    mouse.x = Math.round((event.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
    mouse.y = Math.round((event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
    currentPoint.x = mouse.x;
    currentPoint.y = mouse.y;
    $("#mouseX").html("X: " + mouse.x);
    $("#mouseY").html("Y: " + mouse.y);
}

function drawLine(startX, startY) {
    const canvas = document.getElementById('experimentLSystemCanvas');
    const context = canvas.getContext('2d');
    if (validateAngle(fractal.currentAngle)) {
        const theta = degreeToRadian(fractal.currentAngle);
        const endX = Math.round(startX + fractal.lineL * Math.cos(theta));
        const endY = Math.round(startY + fractal.lineL * Math.sin(theta));

        context.strokeStyle = getRandomColour();
        context.lineWidth = fractal.lineL / 5;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();

        currentPoint.x = endX;
        currentPoint.y = endY;
    }
}

function iterateOverRule(canvas, rule) {
    const rules = {
        A: $("#ruleA").val(),
        B: $("#ruleB").val()
    }

    for (let char of rule) {
        if (char === "A") {
            processRule(canvas, rules.A);
        } else if (char === "B") {
            processRule(canvas, rules.B);
        }
    }
}

function processRule(canvas, rule) {
    for (let character of rule) {
        parseInt(fractal.currentAngle);
        let temp = fractal.currentAngle
        switch (character) {
            case 'F':
                drawLine(currentPoint.x, currentPoint.y);
                break;
            case '+':
                if (fractal.currentAngle + fractal.angle < 360) {
                    fractal.currentAngle += fractal.angle
                } else {
                    fractal.currentAngle = ((temp - 360) + fractal.angle);
                }
                break;
            case'-':
                if (fractal.currentAngle - fractal.angle >= 0) {
                    fractal.currentAngle -= fractal.angle;
                } else {
                    fractal.currentAngle = (temp - fractal.angle + 360);
                }
                break;
            case '[':
                stashPoint.x = currentPoint.x;
                stashPoint.y = currentPoint.y;
                stashAngle = fractal.currentAngle;
                break;
            case ']':
                currentPoint.x = stashPoint.x;
                currentPoint.y = stashPoint.y;
                fractal.currentAngle = stashAngle;
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
    fractal.lineL = parseInt($("#lineLength").val());
    fractal.iterations = parseInt($("#iterations").val());


    if (
        testRegex(ruleABecomes, ruleBBecomes) &&
        testRuleCharacters(ruleA, ruleB) &&
        validateAngle(fractal.angle) &&
        validateAngle(fractal.startAngle)
    ) {
        if (currentPoint.x === mouse.x && currentPoint.y === mouse.y) {
            fractal.currentAngle = fractal.startAngle;
        } else {
            fractal.currentAngle = finalAngle;
            currentPoint.x = finalPoint.x;
            currentPoint.y = finalPoint.y;
        }
        lSystemGenerate(canvas, lSystemString, fractal.iterations);

        finalPoint.x = currentPoint.x;
        finalPoint.y = currentPoint.y;
        finalAngle = fractal.currentAngle;
    }
}

function resetCanvas() {
    const canvas = document.getElementById('experimentLSystemCanvas');
    const context = canvas.getContext('2d');
    currentPoint.x = mouse.x;
    currentPoint.y = mouse.y;
    finalPoint.x = 0;
    finalPoint.y = 0;
    finalAngle = 0;
    fractal.currentAngle = 0
    fractal.lineL = parseInt($("#lineLength").val());
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

function lSystemGenerate(canvas, string, iterations) {
    for (let iter = 0; iter < iterations; iter++) {
        string = lSystemCompute(string);
        iterateOverRule(canvas, string);
        fractal.lineL *= 0.8;
    }
}


function validateAngle(angle) {
    return (angle < 360 && angle > 0) === true;
}

function degreeToRadian(degrees) {
    return degrees * (Math.PI / 180);
}

function getRandomColour() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
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
        if (lineLength <= 0) {
            error += `<br> You cannot draw a fractal with a line length of 0 or below!`
        }
        if (mouse.x === 0 && mouse.y === 0) {
            error += `<br> Please click on the canvas to initialise a point.`
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

function testRegex(ruleString1, ruleString2) {
    return regex.test(ruleString1) && regex.test(ruleString2) === true;
}

function testRuleCharacters(ruleChar1, ruleChar2) {
    return language.test(ruleChar1) && language.test(ruleChar2) === true;
}








