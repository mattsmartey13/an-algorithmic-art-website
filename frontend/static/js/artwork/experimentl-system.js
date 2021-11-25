const language = ['+', '-', '[', ']', 'F', 'A', 'B'];
const regex = /^[a-bA-B]*$/

let mouse = { x: 0, y: 0 };
let stashPoint = { x: 0, y: 0 };
let finalPoint = { x: 0, y: 0 };
let stashAngle = 0;
let finalAngle = 0;
let fractalNumber = 0;

let fractal = {
    angle: 0,
    startAngle: 0,
    currentAngle: 0,
    lineL: 0,
    iterations: 1,
    multiplier: 1
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
    const noSpaceRule = removeSpaces(rule);
    const ruleOk = onlyContainsAlphabet(language, noSpaceRule);
    if (ruleOk) {
        for (let n in noSpaceRule) {
            let character = applyRule(noSpaceRule, n);
            processRuleCharacter(canvas, character);
        }
        finalPoint.x = currentPoint.x;
        finalPoint.y = currentPoint.y;
    } else {
        throw new DOMException(`Please revise your rule: ${rule} so it fits the alphabet provided.`);
    }
}

function processRuleCharacter(canvas, character) {
    let temp = parseInt(fractal.currentAngle);
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
        case 'A':
            iterateOverRule(canvas, $("#ruleA").val())
            break;
        case 'B':
            iterateOverRule(canvas, $("#ruleB").val())
            break;
    }
}

function drawFractal() {
    const canvas = document.getElementById("experimentLSystemCanvas");
    const stringToDraw = $("#drawRuleBox").val();
    const axiom = returnAxiom();

    fractal.angle = parseInt($("#angle").val());
    fractal.startAngle = parseInt($("#startAngle").val());

    if(fractalNumber === 0) {
        fractal.lineL = parseInt($("#lineLength").val());
    }

    fractal.multiplier = parseInt($("#iterationMultiplier").val());
    fractal.iterations = parseInt($("#iterations").val());

    if(testRegex(stringToDraw)) {
        if (currentPoint.x === mouse.x && currentPoint.y === mouse.y) {
            fractal.currentAngle = fractal.startAngle;
        } else {
            fractal.currentAngle = finalAngle;
            currentPoint.x = finalPoint.x;
            currentPoint.y = finalPoint.y;
        }

        iterateOverRule(canvas, axiom);
        currentPoint.x = finalPoint.x;
        currentPoint.y = finalPoint.y;
        for (let i = 0; i < fractal.iterations; i++) {
            fractal.lineL *= ((fractal.multiplier / 100) + 1);
            iterateOverRule(canvas, stringToDraw);
            currentPoint.x = finalPoint.x;
            currentPoint.y = finalPoint.y;
        }

        finalPoint.x = currentPoint.x;
        finalPoint.y = currentPoint.y;
        finalAngle = fractal.currentAngle;
        fractalNumber++;
    }
}

function resetFractal() {
    const canvas = document.getElementById('experimentLSystemCanvas');
    const context = canvas.getContext('2d');

    currentPoint.x = mouse.x;
    currentPoint.y = mouse.y;
    finalPoint.x = 0;
    finalPoint.y = 0;
    finalAngle = 0;
    fractal.currentAngle = 0
    fractal.lineL = parseInt($("#lineLength").val());
    fractalNumber = 0;

    context.clearRect(0, 0, canvas.width, canvas.height);
}

function returnAxiom() {
    const rules = {
        A: $("#ruleA").val(),
        B: $("#ruleB").val()
    }

    if ($("#ruleARadio").prop("checked")) {
        return rules.A;
    } else if ($("#ruleBRadio").prop("checked")) {
        return rules.B;
    } else {
        return undefined;
    }
}

function validateAngle(angle) {
    return !(angle > 360 || angle < 0);
}

function applyRule(rule, char) {
    return rule[char];
}

function removeSpaces(ruleString) {
    return ruleString.split(' ').join('').split('');
}

function onlyContainsAlphabet(alphabet, ruleArray) {
    return ruleArray.every(element => alphabet.includes(element));
}

function degreeToRadian(degrees) {
    return degrees * (Math.PI / 180);
}

function getRandomColour() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function errorFinder() {
    let error = "";
    let errorMessage = document.getElementById('l-systemerrormsg');
    let startAngle = parseInt($("#startAngle").val());
    let rotationAngle = parseInt($("#angle").val());
    let lineLength = parseInt($("#lineLength").val());
    let axiom = returnAxiom();
    let ruleA = $("#ruleA").val();
    let ruleB = $("#ruleB").val();
    let ruleString = $("#drawRuleBox").val();
    try {
        if (startAngle > 360 || startAngle < 0) {
            error += `<br> ${startAngle} is not within the 0-360 bounds for the starting angle.`
        }
        if (rotationAngle > 360 || rotationAngle < 0) {
            error += `<br> ${rotationAngle} is not within the 0-360 bounds for the rotational angle.`
        }
        if (axiom === undefined) {
            error += `<br> You need to select an axiom to kickstart your drawing.`
        }
        if (ruleA === "" && ruleString.includes("A")) {
            error += `<br> You need to define rule A if you want to include it in the string.`
        }
        if (ruleB === "" && ruleString.includes("B")) {
            error += `<br> You need to define rule B if you want to include it in the string.`
        }
        if (ruleB.includes("A") && ruleA.includes("B")) {
            error += `<br> You are calling Rule A in B and Rule B in A. This will cause the program to crash!`
        }
        if (ruleString === "") {
            error += `<br> Your algorithm is blank.`
        }
        if (!testRegex(ruleString)) {
            error += `<br> Please enter in terms of A and B your algorithm.`
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

function testRegex(ruleString) {
    return regex.test(ruleString) === true;
}








