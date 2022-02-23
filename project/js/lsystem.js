const lsystemLanguageRegex = /^[F+\-\[\]]*$/;
const regexAB = /^[a-bA-B]*$/
const lSystemLanguage = ['F', '+', '-'];
const lSystemLanguageWithBrackets = ['F', '+', '-', '[', ']'];
Object.freeze(lSystemLanguage);
Object.freeze(lSystemLanguageWithBrackets);

function drawGenericLine(context, startX, startY, colour, lineWidth, endX, endY) {
    context.save();
    context.beginPath();
    context.strokeStyle = colour;
    context.lineWidth = lineWidth;
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.closePath();
    context.stroke();
}

/**
 * Helper method for branching
 * @param min
 * @param max
 * @returns {number}
 */
function randomNumberBetweenRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function isInRange(number, min, max) {
    return number >= min && number <= max;
}

function getAllIndexes(arr, val) {
    let indexes = [], i;
    for (i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

function setPointFromPoint(point, x, y, degrees) {
    point.x = x;
    point.y = y;
    point.degrees = degrees;
}

/**
 * Clear the canvas
 */
function resetLSystemCanvas(canvas, currentPoint, stashPoint, mouse) {
    const context = canvas.getContext('2d');
    currentPoint.x = mouse.x;
    currentPoint.y = mouse.y;
    stashPoint.x = 0;
    stashPoint.y = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
}

function generateFractalString(stringLength, branchStartIndex) {
    let ruleArray = [], tempLang = [];

    for (let i = 0; i < stringLength; i++) {
        let ruleInput, tempLangIndex;
        if (i < branchStartIndex) {
            ruleInput = "F";
        } else if (ruleArray[i - 1] !== "F" && ruleArray[i - 2] !== "F") {
            ruleInput = "F";
        } else {
            if (ruleArray[i - 1] === "+" || ruleArray[i - 2] === "+") {
                tempLang = ["F, -"];
            } else if (ruleArray[i - 1] === "-" || ruleArray[i - 2] === "-") {
                tempLang = ["F, +"];
            } else {
                tempLang = lSystemLanguage;
            }
            tempLangIndex = Math.floor(Math.random() * lSystemLanguage.length);
            ruleInput = tempLang[tempLangIndex]
        }
        ruleArray.push(ruleInput)
    }
    return ruleArray;
}

function degreeToRadian(degrees) {
    return degrees * (Math.PI / 180);
}

function validateAngle(angle) {
    return (angle < 360 && angle > 0) === true;
}

function getRandomColour() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function testRegex(ruleString1, ruleString2) {
    return regexAB.test(ruleString1) && regexAB.test(ruleString2) === true;
}

function testRuleCharacters(ruleChar1, ruleChar2) {
    return lsystemLanguageRegex.test(ruleChar1) && lsystemLanguageRegex.test(ruleChar2) === true;
}

function validateLineLength(lineLength) {
    return lineLength > 0;
}

function canvasOnMouseOver(canvas, event) {
    let canvasRect = canvas.getBoundingClientRect();
    let x = Math.round((event.clientX - canvasRect.left) / (canvasRect.right - canvasRect.left) * canvas.width);
    let y = Math.round((event.clientY - canvasRect.top) / (canvasRect.bottom - canvasRect.top) * canvas.height);

    return {x, y};
}

function canvasOnMouseClick(canvas, event, currentPointVar, mouseVar) {
    let coordinates = canvasOnMouseOver(canvas, event);
    currentPointVar.x = coordinates.x;
    currentPointVar.y = coordinates.y;

    mouseVar.x = coordinates.x;
    mouseVar.y = coordinates.y;
}

/**
 * Rotate angle, true for clockwise, false for anticlockwise
 * @param b
 * @param angle
 * @param currentPointVar
 */
function rotatePointDirection(b, angle, currentPointVar) {
    parseInt(angle);
    const temp = currentPointVar.degrees;
    if (b === true) {
        if (currentPointVar.degrees + angle < 360) {
            currentPointVar.degrees += angle;
        } else {
            currentPointVar.degrees = ((temp - 360) + angle);
        }
    } else {
        if (currentPointVar.degrees - angle >= 0) {
            currentPointVar.degrees -= angle;
        } else {
            currentPointVar.degrees = (temp - angle + 360);
        }
    }
}

function getEndpoints(startX, startY, lineLength, theta) {
    const endX = Math.round(startX + lineLength * Math.cos(theta));
    const endY = Math.round(startY + lineLength * Math.sin(theta));

    return { endX, endY };
}

