const gardenLanguage = ["F", "+", "-"];
Object.freeze(gardenLanguage);

const currentType = {
    name: '',
    rotationAngle: 0,
    length: 0,
    width: 0,
    minAngle: 0,
    maxAngle: 0,
    minBranches: 0,
    maxBranches: 0,
    branchLength: 0,
    branchStartIndex: 0,
    branchEndIndex: 0,
    stringLength: 0,
};

const gardenMouse = {
    x: 0,
    y: 0
};

let gardenCurrentPoint = {
    'x': 0,
    'y': 0,
    'degrees': 0,
}

let gardenStashPoint = {
    'x': 0,
    'y': 0,
    'degrees': 0
}

/**
 * On canvas scroll custom event handler
 */
function gardenCanvasOnMouseOver() {
    const gardenCanvas = document.getElementById('garden-canvas');
    let gardenCanvasRect = gardenCanvas.getBoundingClientRect();
    $("#gardenMouseFloatX").html("X: " + Math.round((event.clientX - gardenCanvasRect.left) / (gardenCanvasRect.right - gardenCanvasRect.left) * gardenCanvas.width));
    $("#gardenMouseFloatY").html("Y: " + Math.round((event.clientY - gardenCanvasRect.top) / (gardenCanvasRect.bottom - gardenCanvasRect.top) * gardenCanvas.height));
}

/**
 * Onclick custom event handler
 * @param event
 */
function gardenCanvasOnClick(event) {
    const gardenCanvas = document.getElementById('garden-canvas'), ct = currentType, gcp = gardenCurrentPoint;
    let gardenCanvasRect = gardenCanvas.getBoundingClientRect();
    let button = document.getElementById('garden-setup-btn');
    gardenMouse.x = Math.round((event.clientX - gardenCanvasRect.left) / (gardenCanvasRect.right - gardenCanvasRect.left) * gardenCanvas.width);
    gardenMouse.y = Math.round((event.clientY - gardenCanvasRect.top) / (gardenCanvasRect.bottom - gardenCanvasRect.top) * gardenCanvas.height);
    gardenCurrentPoint.x = gardenMouse.x;
    gardenCurrentPoint.y = gardenMouse.y;
    $("#gardenMouseX").html("X: " + gardenMouse.x);
    $("#gardenMouseY").html("Y: " + gardenMouse.y);

    if (button.disabled) {
        setPlantProperties(ct.name);
        generateGardenComponent(ct.name, gcp.x, gcp.y, gcp.degrees, ct.stringLength, ct.length, ct.width);
    }
}

/**
 * Setup our garden with soil and green layer
 */
function gardenSetup() {
    const gardenCanvas = document.getElementById('garden-canvas');
    const gardenContext = gardenCanvas.getContext('2d');
    gardenContext.save();
    //setup soil
    gardenContext.fillStyle = "#5b3216"
    gardenContext.fillRect(0, gardenCanvas.height * 0.85, gardenCanvas.width, gardenCanvas.height * 0.15);

    //setup grass layer
    gardenContext.fillStyle = "#348C31";
    gardenContext.fillRect(0, gardenCanvas.height * 0.80, gardenCanvas.width, gardenCanvas.height * 0.05);

    $('#garden-setup-btn').attr('disabled', true);
}

/**
 * Uses the rule generator and interpreter to create our plant
 * Used when the canvas is set up and the user clicks the canvas
 */
function generateGardenComponent(typeName, startX, startY, startAngle, stringLength, lineLength, lineWidth) {
    const lSystemRule = ruleGenerator(typeName, stringLength);
    if (typeName !== 'grass') {
        interpretRule(lSystemRule, typeName, startX, startY, startAngle, lineLength, lineWidth);
    } else {
        let grassRecurse = 20;
        while (grassRecurse > 0) {
            interpretRule(lSystemRule, typeName, startX + 5, startY, startAngle, lineLength, lineWidth);
            startX += 5;
            startAngle = 270;
            grassRecurse--;
        }
    }
}

/**
 * Takes the plant parameters and generates an L system
 * @param type
 * @param length
 * @returns {*[]}
 */
function ruleGenerator(type, length) {
    const ct = currentType;
    let gardenRuleArray = generatePlantString(length, ct.branchStartIndex);

    /**
     * Insert brackets where it is worthwhile to, based on the type's given likeliness.
     *
     * UPDATE AAWVJ36 - instead of putting brackets at random places, create new strings and then slide them in
     * This will make the tree appear thicker
     */
    let currentBranches = randomNumberBetweenRange(ct.minBranches, ct.maxBranches);
    for (let i = 0; i < currentBranches; i++) {
        if (length > ct.branchLength) {
            let branchIndex = randomNumberBetweenRange(ct.branchStartIndex, ct.branchEndIndex);
            gardenRuleArray.splice(branchIndex, 0, "[")
            gardenRuleArray.splice(branchIndex + 1, 0, "]");
            ct.branchStartIndex = i + 1;
        }
    }
    return gardenRuleArray;
}

/**
 * Set the type of the fractal based on the button pressed by the user
 * Will assign the parameters of the length, width, colour of lines, rotation degree etc
 * @param typeName
 */
function setPlantProperties(typeName) {
    const gardenCanvas = document.getElementById('garden-canvas');
    const gardenContext = gardenCanvas.getContext('2d');
    const ct = currentType, gcp = gardenCurrentPoint;
    ct.name = typeName;

    switch (ct.name) {
        case "flower":
            gardenContext.strokeStyle = "#446327";
            setBaseFlowerSettings();
            break;
        case "tree":
            gardenContext.strokeStyle = "#6e4300";
            gardenContext.fillStyle = "#087000";
            setBaseTreeSettings();
            break;
        case "shoot":
            gardenContext.strokeStyle = "#25523b";
            gardenContext.fillStyle = "#5aab61";
            setBaseShootSettings();
            break;
        case "cloud":
            gardenContext.strokeStyle = "#81a5ba";
            setBaseCloudSettings();
            break;
        case "grass":
            gardenContext.strokeStyle = "#348C31";
            gardenContext.fillStyle = "#348C31";
            setBaseGrassSettings();
            break;
    }
    gardenContext.save();
    document.getElementById('garden-type-output').innerHTML = ct.name;
}


/**
 * Processes the individual pieces of the fractal to generate line, rotation, stashing and restoring of branches
 * @param gardenRuleArray
 * @param typeName
 * @param currentX
 * @param currentY
 * @param startAngle
 * @param lineLength
 * @param lineWidth
 */
function interpretRule(gardenRuleArray, typeName, currentX, currentY, startAngle, lineLength, lineWidth) {
    const gardenCanvas = document.getElementById('garden-canvas');
    const gardenContext = gardenCanvas.getContext('2d');
    const gcp = gardenCurrentPoint, gsp = gardenStashPoint, ct = currentType;
    validateDynamicPlantIntegers();
    let index = 0;
    /**
     * Sift through each member of the array and carry out operation based on the sign at index "character"
     */
    for (let character of gardenRuleArray) {
        index++;
        switch (character) {
            case 'F':
                /**
                 * Branches in a tree should shrink a bit, and back to the original size when going back
                 * to the original
                 */
                const allLineIndexes = getAllIndexes(gardenRuleArray, 'F');
                const stemRange = (start, end) => {
                    return index - 1 >= allLineIndexes[allLineIndexes.length - start] && index - 1 <= allLineIndexes[allLineIndexes.length - end];
                }
                const branchEnd = () => {
                    return gardenRuleArray[index] === "[" || gardenRuleArray[index - 1] === "[";
                }
                drawGardenLine(currentX, currentY, startAngle, lineLength, lineWidth);
                if (typeName === "tree" && (branchEnd() || stemRange(4, 1))) {
                    drawLeaf(currentX + 10, currentY, lineLength * 1.5, startAngle + ct.rotationAngle, Math.PI / 2);
                    drawLeaf(currentX - 10, currentY, lineLength * 1.5, startAngle - ct.rotationAngle, Math.PI / 2);
                    drawLeaf(currentX, currentY + 10, lineLength * 1.5, startAngle + ct.rotationAngle, Math.PI / 2);
                    drawLeaf(currentX, currentY - 10, lineLength * 1.5, startAngle - ct.rotationAngle, Math.PI / 2);
                }

                if (typeName === "flower" && (branchEnd() || stemRange(2, 1))) {
                    gardenContext.fillStyle = returnRandomFlowerColour();
                    drawLeaf(currentX.x, gcp.y, startAngle + ct.rotationAngle, Math.PI);
                    drawLeaf(currentX + 10, currentY + 10, lineLength * 2, startAngle - ct.rotationAngle, Math.PI / 2);
                    drawLeaf(currentX - 10, currentY - 10, lineLength * 2, startAngle + ct.rotationAngle, Math.PI / 2);
                    drawLeaf(currentX + 10, currentY - 10, lineLength * 2, startAngle - ct.rotationAngle, Math.PI / 2);
                    drawLeaf(currentX - 10, currentY + 10, lineLength * 2, startAngle + ct.rotationAngle, Math.PI / 2);
                }

                currentX = gcp.x;
                currentY = gcp.y;
                startAngle = gcp.degrees;
                break;
            case '+':
                ct.rotationAngle = randomNumberBetweenRange(ct.minAngle, ct.maxAngle);
                rotateCurrentPoint(true, ct.rotationAngle);
                break;
            case '-':
                ct.rotationAngle = randomNumberBetweenRange(ct.minAngle, ct.maxAngle);
                rotateCurrentPoint(false, ct.rotationAngle);
                break;
            case '[':
                stashGardenPoint(currentX, currentY, startAngle);
                if (ct.minBranches > 0 && lineWidth > 1 && lineLength > 1) {
                    generateGardenComponent(typeName, currentX, currentY, startAngle - ct.rotationAngle, ct.branchLength * 0.8, lineLength * 0.8, lineWidth * 0.8);
                    generateGardenComponent(typeName, currentX, currentY, startAngle + ct.rotationAngle, ct.branchLength * 0.8, lineLength * 0.8, lineWidth * 0.8);
                }
                break;
            case ']':
                restoreGardenPoint(gsp.x, gsp.y, gsp.degrees);
                break;
        }
    }
}

/**
 * Straight line for everything except clouds, clouds will use Bezier curves
 *
 * @param startX
 * @param startY
 * @param degrees
 * @param lineLength
 * @param lineWidth
 */
function drawGardenLine(startX, startY, degrees, lineLength, lineWidth) {
    const gardenCanvas = document.getElementById('garden-canvas');
    const gardenContext = gardenCanvas.getContext('2d');
    const theta = degreeToRadian(degrees);
    const endX = Math.round(startX + lineLength * Math.cos(theta));
    const endY = Math.round(startY + lineLength * Math.sin(theta));

    gardenContext.save();
    gardenContext.beginPath();
    gardenContext.lineWidth = lineWidth;
    gardenContext.moveTo(startX, startY);

    if (currentType.name === "cloud") {
        const cloudCurve = Math.floor(Math.random() * lineLength * lineWidth);
        gardenContext.bezierCurveTo(startX, startY + cloudCurve, endX, endY + cloudCurve, endX, endY);
        gardenContext.bezierCurveTo(startX, startY - cloudCurve, endX, endY - cloudCurve, endX, endY);
        gardenContext.bezierCurveTo(startX, startY + cloudCurve, endX, endY - cloudCurve, endX, endY);
        gardenContext.bezierCurveTo(startX, startY - cloudCurve, endX, endY + cloudCurve, endX, endY);
    } else {
        gardenContext.lineTo(endX, endY);
    }
    gardenContext.closePath();
    gardenContext.stroke();

    gardenCurrentPoint.x = endX;
    gardenCurrentPoint.y = endY;
}

/**
 * Draw leaves, basic arc circle shape
 * @param x
 * @param y
 * @param length
 * @param angle
 * @param rot
 */
function drawLeaf(x, y, length, angle, rot) {
    const gardenCanvas = document.getElementById('garden-canvas');
    const gardenContext = gardenCanvas.getContext('2d');
    const ct = currentType;

    gardenContext.beginPath();
    gardenContext.arc(x, y, ct.length, length, angle, rot);
    gardenContext.fill();
    gardenContext.closePath();
}

/**
 * Rotate angle, true for clockwise, false for anticlockwise
 * @param b
 * @param angle
 */
function rotateCurrentPoint(b, angle) {
    parseInt(angle);
    const gcp = gardenCurrentPoint;
    const temp = gcp.degrees;
    if (b === true) {
        if (gcp.degrees + angle < 360) {
            gcp.degrees += angle;
        } else {
            gcp.degrees = ((temp - 360) + angle);
        }
    } else {
        if (gcp.degrees - angle >= 0) {
            gcp.degrees -= angle;
        } else {
            gcp.degrees = (temp - angle + 360);
        }
    }
}

/**
 * Stash function for the start of a branch
 * @param x
 * @param y
 * @param degrees
 */
function stashGardenPoint(x, y, degrees) {
    gardenStashPoint.x = x;
    gardenStashPoint.y = y;
    gardenStashPoint.degrees = degrees;
}

/**
 * Restore function for exiting a branch and going back to the main
 * @param x
 * @param y
 * @param degrees
 */
function restoreGardenPoint(x, y, degrees) {
    gardenCurrentPoint.x = x;
    gardenCurrentPoint.y = y;
    gardenCurrentPoint.degrees = degrees;
}

/**
 * Clear the canvas, will also clear the ground - you will need to setup the canvas again
 */
function resetGardenCanvas() {
    const gardenCanvas = document.getElementById('garden-canvas');
    const gardenContext = gardenCanvas.getContext('2d');
    gardenCurrentPoint.x = gardenMouse.x;
    gardenCurrentPoint.y = gardenMouse.y;
    gardenStashPoint.x = 0;
    gardenStashPoint.y = 0;

    gardenContext.clearRect(0, 0, gardenCanvas.width, gardenCanvas.height);
    gardenContext.save();
    $('#garden-setup-btn').attr('disabled', false);
}

/**
 * Feel free to add to this selection of colours for the flower leaves
 * @returns {string}
 */
function returnRandomFlowerColour() {
    const flowerColours = ["#FAE033", "#FC7B7B", "#FFA000", "#440044", "#440044", "#53C5CE"];
    return flowerColours[Math.floor(Math.random() * (flowerColours.length - 1))];
}

/**
 * Ensure we are passing integers to plant variables that see a lot of value changes
 */
function validateDynamicPlantIntegers() {
    parseInt(gardenCurrentPoint.degrees);
    parseInt(gardenCurrentPoint.x);
    parseInt(gardenCurrentPoint.y);
    parseInt(currentType.degrees);
}

/**
 * Helper method to generate a random branch size for trees, shoots etc
 * @param min
 * @param max
 * @returns {number}
 */
function randomNumberBetweenRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Generate semi-random assortment of F, + and -.
 */
function generatePlantString(stringLength, branchStartIndex) {
    let gardenRuleArray = [], tempLang = [];

    for (let i = 0; i < stringLength; i++) {
        let ruleInput, tempLangIndex;
        if (i < branchStartIndex) {
            ruleInput = "F";
        } else if (gardenRuleArray[i - 1] !== "F" && gardenRuleArray[i - 2] !== "F") {
            ruleInput = "F";
        } else {
            if (gardenRuleArray[i - 1] === "+" || gardenRuleArray[i - 2] === "+") {
                tempLang = ["F, -"];
            } else if (gardenRuleArray[i - 1] === "-" || gardenRuleArray[i - 2] === "-") {
                tempLang = ["F, +"];
            } else {
                tempLang = gardenLanguage;
            }
            tempLangIndex = Math.floor(Math.random() * gardenLanguage.length);
            ruleInput = tempLang[tempLangIndex]
        }
        gardenRuleArray.push(ruleInput)
    }
    return gardenRuleArray;
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

/**
 * Shoot settings setter
 */
function setBaseShootSettings() {
    gardenCurrentPoint.degrees = 270;
    currentType.rotationAngle = 20;
    currentType.length = 5;
    currentType.width = 1.5;
    currentType.minAngle = 5;
    currentType.maxAngle = 20;
    currentType.minBranches = 0;
    currentType.maxBranches = 1;
    currentType.branchLength = 3;
    currentType.stringLength = 12;
    currentType.branchStartIndex = 5;
    currentType.branchEndIndex = 10
}

/**
 * Grass settings setter
 */
function setBaseGrassSettings() {
    gardenCurrentPoint.degrees = 270;
    currentType.rotationAngle = 5;
    currentType.length = 2.5;
    currentType.width = 1.5;
    currentType.minAngle = 1;
    currentType.maxAngle = 10;
    currentType.minBranches = 0;
    currentType.maxBranches = 0;
    currentType.stringLength = 10;
    currentType.branchStartIndex = 5;
    currentType.branchEndIndex = 10;
}

/**
 * Cloud settings setter
 */
function setBaseCloudSettings() {
    gardenCurrentPoint.degrees = 0;
    currentType.rotationAngle = 15;
    currentType.length = 12;
    currentType.width = 10;
    currentType.minAngle = 5;
    currentType.maxAngle = 20;
    currentType.minBranches = 0;
    currentType.maxBranches = 2;
    currentType.stringLength = 15;
    currentType.branchStartIndex = 5;
    currentType.branchEndIndex = 15;
}

/**
 * Flower settings setter
 */
function setBaseFlowerSettings() {
    gardenCurrentPoint.degrees = 270;
    currentType.rotationAngle = 15;
    currentType.length = 5;
    currentType.width = 2;
    currentType.minAngle = 5;
    currentType.maxAngle = 20;
    currentType.minBranches = 1;
    currentType.maxBranches = 3;
    currentType.branchLength = 4;
    currentType.stringLength = 20;
    currentType.branchStartIndex = 10;
    currentType.branchEndIndex = 18;
}

function setBaseTreeSettings() {
    gardenCurrentPoint.degrees = 270;
    currentType.rotationAngle = 20;
    currentType.length = 10;
    currentType.width = 10;
    currentType.minAngle = 10;
    currentType.maxAngle = 50;
    currentType.minBranches = 4;
    currentType.maxBranches = 10;
    currentType.branchLength = 15;
    currentType.stringLength = 50;
    currentType.branchStartIndex = 10;
    currentType.branchEndIndex = 80;
}

