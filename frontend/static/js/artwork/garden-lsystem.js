const gardenLanguage = ["F", "+", "-"];
Object.freeze(gardenLanguage);

const currentType = {
    name: '',
    rotationAngle: 0,
    length: 0,
    width: 0,
    minAngle: 0,
    maxAngle: 0,
    branches: 0,
    branchLength: 0,
    branchStartIndex: 0,
    branchEndIndex: 0,
    stringLength: 0,
    branchLikely: 0
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
    const gardenCanvas = document.getElementById('garden-canvas');
    let gardenCanvasRect = gardenCanvas.getBoundingClientRect();
    gardenMouse.x = Math.round((event.clientX - gardenCanvasRect.left) / (gardenCanvasRect.right - gardenCanvasRect.left) * gardenCanvas.width);
    gardenMouse.y = Math.round((event.clientY - gardenCanvasRect.top) / (gardenCanvasRect.bottom - gardenCanvasRect.top) * gardenCanvas.height);
    gardenCurrentPoint.x = gardenMouse.x;
    gardenCurrentPoint.y = gardenMouse.y;
    $("#gardenMouseX").html("X: " + mouse.x);
    $("#gardenMouseY").html("Y: " + mouse.y);

    if (currentType.name !== '' && $('#garden-setup-btn').attr('disabled', true)) {
        generateGardenComponent();
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
function generateGardenComponent() {
    const lSystemRule = ruleGenerator(currentType.name);
    if (currentType.name === "grass") {
        for (let i = 0; i < 20; i++) {
            gardenStashPoint.x = gardenCurrentPoint.x + 5;
            gardenStashPoint.y = gardenCurrentPoint.y;
            gardenStashPoint.degrees = gardenCurrentPoint;

            interpretRule(lSystemRule, gardenCurrentPoint, currentType);
            gardenCurrentPoint.x = gardenStashPoint.x;
            gardenCurrentPoint.y = gardenStashPoint.y;
            gardenCurrentPoint.degrees = 270;
        }
    } else {
        interpretRule(lSystemRule, gardenCurrentPoint, currentType);
    }

    gardenCurrentPoint.x = 0;
    gardenCurrentPoint.y = 0;
    gardenStashPoint.x = 0;
    gardenStashPoint.y = 0;

    if (currentType.name !== 'cloud') {
        gardenCurrentPoint.degrees = 270;
    } else {
        gardenCurrentPoint.degrees = 0;
    }
    gardenStashPoint.degrees = gardenCurrentPoint.degrees;
}

/**
 * Takes the plant parameters and generates an L system
 * @param type
 * @returns {*[]}
 */
function ruleGenerator(type) {
    const ct = currentType;
    let gardenRuleArray = generatePlantString(ct.stringLength, ct.branchStartIndex);

    /**
     * Insert brackets where it is worthwhile to, based on the type's given likeliness.
     */
    let currentBranches = Math.round(ct.branches * Math.random());
    for (let i = ct.branchStartIndex; i < ct.branchEndIndex; i++) {
        const branchSize = randomNumberBetweenRange(i, i + ct.branchLength);
        const likely = Math.random();
        if (likely >= ct.branchLikely && currentBranches > 0) {
            gardenRuleArray.splice(i - 1, 0, "[")
            gardenRuleArray.splice(i + branchSize - 1, 0, "]");
            i += branchSize;
            currentBranches -= 1;
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
        default:
            gcp.degrees = 270;
            ct.branches = 0;
            ct.stringLength = 14;
            ct.rotationAngle = 0;
            ct.length = 1;
            ct.width = 1;
            ct.rotationAngle = 0;
            ct.minAngle = 0;
            ct.maxAngle = 0;
            gardenContext.strokeStyle = "#000000";
            gardenContext.fillStyle = "#000000";
            break;
    }
    gardenContext.save();
    document.getElementById('garden-type-output').innerHTML = ct.name;
}


/**
 * Processes the individual pieces of the fractal to generate line, rotation, stashing and restoring of branches
 * @param gardenRuleArray
 */
function interpretRule(gardenRuleArray) {
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
                drawGardenLine(gcp.x, gcp.y, gcp.degrees);
                if (ct.name === "tree") {
                    if (index > ct.branchStartIndex) {
                        drawLeaf(gcp.x + 10, gcp.y, gcp.degrees + ct.rotationAngle, Math.PI / 2);
                        drawLeaf(gcp.x - 10, gcp.y, gcp.degrees - ct.rotationAngle, Math.PI / 2);
                        drawLeaf(gcp.x, gcp.y + 10, gcp.degrees + ct.rotationAngle, Math.PI / 2);
                        drawLeaf(gcp.x, gcp.y - 10, gcp.degrees - ct.rotationAngle, Math.PI / 2);
                    }
                }

                if (ct.name === "flower" && index > ct.branchEndIndex) {
                    gardenContext.fillStyle = returnRandomFlowerColour();
                    drawLeaf(gcp.x, gcp.y, gcp.degrees + ct.rotationAngle, Math.PI);
                    drawLeaf(gcp.x + 10, gcp.y + 10, gcp.degrees - ct.rotationAngle, Math.PI / 2);
                    drawLeaf(gcp.x - 10, gcp.y - 10, gcp.degrees + ct.rotationAngle, Math.PI / 2);
                    drawLeaf(gcp.x + 10, gcp.y - 10, gcp.degrees - ct.rotationAngle, Math.PI / 2);
                    drawLeaf(gcp.x - 10, gcp.y + 10, gcp.degrees + ct.rotationAngle, Math.PI / 2);
                }
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
                stashGardenPoint(gcp.x, gcp.y, gcp.degrees);
                if (ct.name === "tree") {
                    ct.length *= 0.8;
                    ct.width *= 0.8;
                }
                break;
            case ']':
                restoreGardenPoint(gsp.x, gsp.y, gsp.degrees);
                if (ct.name === "tree") {
                    ct.length /= 0.8;
                    ct.width /= 0.8;
                }
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
 */
function drawGardenLine(startX, startY, degrees) {
    const gardenCanvas = document.getElementById('garden-canvas');
    const gardenContext = gardenCanvas.getContext('2d');
    const theta = degreeToRadian(degrees);
    const endX = Math.round(startX + currentType.length * Math.cos(theta));
    const endY = Math.round(startY + currentType.length * Math.sin(theta));

    gardenContext.save();
    gardenContext.beginPath();
    gardenContext.lineWidth = currentType.width;
    gardenContext.moveTo(startX, startY);

    if (currentType.name === "cloud") {
        console.log(`startAngle: ${degrees}`);
        const cloudCurve = Math.floor(Math.random() * currentType.length * currentType.width);
        gardenContext.bezierCurveTo(startX, startY + cloudCurve , endX, endY + cloudCurve, endX, endY);
        gardenContext.bezierCurveTo(startX, startY - cloudCurve , endX, endY - cloudCurve, endX, endY);
        gardenContext.bezierCurveTo(startX, startY + cloudCurve , endX, endY - cloudCurve, endX, endY);
        gardenContext.bezierCurveTo(startX, startY - cloudCurve , endX, endY + cloudCurve, endX, endY);
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
 * @param angle
 * @param rot
 */
function drawLeaf(x, y, angle, rot) {
    const gardenCanvas = document.getElementById('garden-canvas');
    const gardenContext = gardenCanvas.getContext('2d');
    const ct = currentType;

    gardenContext.beginPath();
    gardenContext.arc(x, y, ct.length * 0.8, angle, rot);
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
            if (gardenRuleArray[i - 1] === "+") {
                tempLang = ["F", "+"];
            } else if (gardenRuleArray[i - 1] === "-") {
                tempLang = ["F", "-"];
            } else {
                tempLang = gardenLanguage;
            }
            tempLangIndex = Math.floor(Math.random() * tempLang.length);
            ruleInput = tempLang[tempLangIndex];
        }
        gardenRuleArray.push(ruleInput)
    }
    return gardenRuleArray;
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
    currentType.branches = 1;
    currentType.branchLength = 3;
    currentType.stringLength = 12;
    currentType.branchLikely = 0.9;
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
    currentType.branches = 0;
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
    currentType.branches = 0;
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
    currentType.branches = 1;
    currentType.branchLength = 4;
    currentType.stringLength = 20;
    currentType.branchLikely = 0.7;
    currentType.branchStartIndex = 5;
    currentType.branchEndIndex = 15;
}

function setBaseTreeSettings() {
    gardenCurrentPoint.degrees = 270;
    currentType.rotationAngle = 30;
    currentType.length = 10;
    currentType.width = 10;
    currentType.minAngle = 10;
    currentType.maxAngle = 50;
    currentType.branches = 6;
    currentType.branchLength = 15;
    currentType.stringLength = 100;
    currentType.branchLikely = 0.8;
    currentType.branchStartIndex = 10;
    currentType.branchEndIndex = 80;
}

