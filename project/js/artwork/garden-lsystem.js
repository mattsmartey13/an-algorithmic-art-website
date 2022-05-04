/**
 * Global variable due to the amount of times the object properties change
 * @type {{branchStartIndex: number, maxAngle: number, length: number, minAngle: number, maxBranches: number, branchLength: number, leafMultiplier: number, rotationAngle: number, name: string, width: number, branchEndIndex: number, stringLength: number, minBranches: number}}
 */
const currentType = {
    name: '',
    rotationAngle: 0,
    length: 0,
    width: 0,
    minAngle: 0,
    maxAngle: 0,
    minBranches: 0,
    maxBranches: 0,
    branchLength: 1,
    branchStartIndex: 0,
    branchEndIndex: 0,
    stringLength: 0,
    leafMultiplier: 1
};

const names = {
    flower: "Flower",
    tree: "Tree",
    shoot: "Shoot",
    cloud: "Cloud",
    grass: "Grass"
}

const gardenMouse = {
    'x': 0,
    'y': 0
};

const gardenCurrentPoint = {
    'x': 0,
    'y': 0,
    'degrees': 0,
}

const gardenStashPoint = {
    'x': 0,
    'y': 0,
    'degrees': 0
}

/**
 * On canvas scroll custom event handler
 */
function gardenCanvasOnMouseOver(event) {
    const gardenCanvas = document.getElementById('gardenCanvas');
    const coordinates = canvasOnMouseOver(gardenCanvas, event);
    $("#gardenMouseFloatX").html("X: " + coordinates.x);
    $("#gardenMouseFloatY").html("Y: " + coordinates.y);
}

/**
 * Onclick custom event handler
 * @param event
 */
function gardenCanvasOnClick(event) {
    const gardenCanvas = document.getElementById('gardenCanvas'), ct = currentType, gcp = gardenCurrentPoint, gsp = gardenStashPoint;
    canvasOnMouseClick(gardenCanvas, event, gardenCurrentPoint, gardenMouse)
    $("#gardenMouseX").html("X: " + gardenMouse.x);
    $("#gardenMouseY").html("Y: " + gardenMouse.y);

    const button = $('#gardenSetupButton');
    if (button.attr('disabled')) {
        setPlantProperties(ct.name);
        generateGardenComponent(gcp, gsp, ct, ct.stringLength);
    }
}

/**
 * Setup our garden with soil and green layer
 */
function gardenSetup() {
    const gardenCanvas = document.getElementById('gardenCanvas');
    const gardenContext = gardenCanvas.getContext('2d');
    gardenContext.save();

    gardenContext.fillStyle = "#5b3216"
    gardenContext.fillRect(0, gardenCanvas.height * 0.85, gardenCanvas.width, gardenCanvas.height * 0.15);
    gardenContext.fillStyle = "#348C31";
    gardenContext.fillRect(0, gardenCanvas.height * 0.80, gardenCanvas.width, gardenCanvas.height * 0.05);

    $('#gardenSetupButton').attr('disabled', true);
    $('#gardenClearCanvasButton').attr('disabled', false);
}

/**
 * Uses the rule generator and interpreter to create our plant
 * Used when the canvas is set up and the user clicks the canvas
 */
function generateGardenComponent(gcp, gsp, ct, stringLength) {
    const lSystemRule = ruleGenerator(ct, stringLength);
    if (ct.name !== names.grass) {
        interpretRule(lSystemRule, gcp, gsp, ct);
    } else {
        let grassRecurse = 20;
        while (grassRecurse > 0) {
            gcp.degrees = 270;
            setPointFromPoint(gsp, gcp.x + 5, gcp.y, gcp.degrees)
            interpretRule(lSystemRule, gcp, gsp, ct);
            setPointFromPoint(gcp, gsp.x, gsp.y, gsp.degrees);
            grassRecurse--;
        }
    }
}

/**
 * Takes the plant parameters and generates an L system
 * @param ct
 * @param stringLength
 * @returns {*[]}
 */
function ruleGenerator(ct, stringLength) {
    const gardenRuleArray = generateRandomisedLSystemString(stringLength, ct.branchStartIndex);
    if (ct.name === names.tree || ct.name === names.flower)
        gardenRuleArray.push('C');

    /**
     * Insert brackets where it is worthwhile to, based on the type's given likeliness.
     *
     * UPDATE AAWVJ36 - brackets slid in between our range points
     * Bracket then recursively calls another generateGardenComponent()
     */
    const currentBranches = randomNumberBetweenRange(ct.minBranches, ct.maxBranches);
    if (currentBranches > 0) {
        for (let i = 0; i < currentBranches; i++) {
            if (stringLength > ct.branchStartIndex) {
                let branchIndex = randomNumberBetweenRange(ct.branchStartIndex, ct.branchEndIndex);
                gardenRuleArray.splice(branchIndex, 0, "[")
                gardenRuleArray.splice(branchIndex + 1, 0, "]");
                ct.branchStartIndex = branchIndex + 2;
            }
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
    const gardenCanvas = document.getElementById('gardenCanvas');
    const gardenContext = gardenCanvas.getContext('2d');
    const gcp = gardenCurrentPoint, ct = currentType;

    switch (typeName) {
        case "Flower":
            gardenContext.strokeStyle = "#446327";
            setBaseFlowerSettings(gcp, ct);
            break;
        case "Tree":
            gardenContext.strokeStyle = "#6e4300";
            gardenContext.fillStyle = "#087000";
            setBaseTreeSettings(gcp, ct);
            break;
        case "Shoot":
            gardenContext.strokeStyle = "#25523b";
            gardenContext.fillStyle = "#5aab61";
            setBaseShootSettings(gcp, ct);
            break;
        case "Cloud":
            gardenContext.strokeStyle = "#A9B7B4";
            gardenContext.fillStyle = "#A9B7B4";
            setBaseCloudSettings(gcp, ct);
            break;
        case "Grass":
            gardenContext.strokeStyle = "#348C31";
            gardenContext.fillStyle = "#348C31";
            setBaseGrassSettings(gcp, ct);
            break;
    }
    gardenContext.save();
    document.getElementById('gardenTypeOutput').innerHTML = typeName;
}

/**
 * Processes the individual pieces of the fractal to generate line, rotation, stashing and restoring of branches
 * @param gardenRuleArray
 * @param gcp
 * @param gsp
 * @param ct
 */
function interpretRule(gardenRuleArray, gcp, gsp, ct) {
    const gardenCanvas = document.getElementById('gardenCanvas');
    const gardenContext = gardenCanvas.getContext('2d');
    validateDynamicPlantIntegers(gcp, ct);
    for (let character of gardenRuleArray) {
        switch (character) {
            case 'F':
                drawGardenLine(gcp, ct.length, ct.width, ct);
                break;
            case '+':
                ct.rotationAngle = randomNumberBetweenRange(ct.minAngle, ct.maxAngle);
                rotatePointDirection(true, ct.rotationAngle, gcp);
                break;
            case '-':
                ct.rotationAngle = randomNumberBetweenRange(ct.minAngle, ct.maxAngle);
                rotatePointDirection(false, ct.rotationAngle, gcp);
                break;
            case '[':
                const angle = randomAngle(gcp, ct);
                branchBehaviour(ct)
                setPointFromPoint(gsp, gcp.x, gcp.y, angle);
                generateGardenComponent(gcp, gsp, ct, ct.branchLength);
                break;
            case ']':
                setPointFromPoint(gcp, gsp.x, gsp.y, gsp.degrees);
                gcp.degrees = randomAngle(gcp, ct);
                break;
            case 'C':
                if (ct.name === names.flower)
                    gardenContext.fillStyle = returnRandomFlowerColour();
                drawLeafCluster(gardenContext, ct, gcp.x, gcp.y, ct.length * ct.leafMultiplier)
                break;
        }
    }
}

function randomAngle(gcp, ct) {
    let angle;
    const angles = [gcp.degrees - ct.rotationAngle, gcp.degrees + ct.rotationAngle]
    const rand = Math.round(Math.random())
    ct.rotationAngle = randomNumberBetweenRange(ct.maxAngle, ct.maxAngle);
    if (rand === 0) {
        angle = angles[0]
    } else {
        angle = angles[1]
    }
    return angle;
}

function branchBehaviour(ct) {
    ct.rotationAngle = randomNumberBetweenRange(ct.minAngle, ct.maxAngle);
    Math.round(ct.length *= 0.8);
    Math.round(ct.width *= 0.8);
    Math.round(ct.stringLength *= 0.8);
}

/**
 * More leaves for trees, others such as flowers get three only.
 * @param context
 * @param ct
 * @param currentX
 * @param currentY
 * @param radius
 * @par
 */
function drawLeafCluster(context, ct, currentX, currentY, radius) {
    if (ct.name === names.tree) {
        drawFilledCircle(context, currentX, currentY - 10, radius, false);
        drawFilledCircle(context, currentX + 10, currentY + 10, radius, true);
        drawFilledCircle(context, currentX - 10, currentY - 10, radius, false);
        drawFilledCircle(context, currentX + 10, currentY - 10, radius, true);
        drawFilledCircle(context, currentX - 10, currentY + 10, radius, false);
    } else {
        drawFilledCircle(context, currentX, currentY - 5, radius, false);
        drawFilledCircle(context, currentX + 5, currentY - 5, radius, true);
        drawFilledCircle(context, currentX - 5, currentY - 5, radius, false);
    }
}

/**
 * Straight line for everything except clouds, clouds are treated as leaves
 *
 * @param gcp
 * @param lineLength
 * @param lineWidth
 * @param ct
 */
function drawGardenLine(gcp, lineLength, lineWidth, ct) {
    const gardenCanvas = document.getElementById('gardenCanvas');
    const gardenContext = gardenCanvas.getContext('2d');
    const theta = degreeToRadian(gcp.degrees);
    const endX = Math.round(gcp.x + lineLength * Math.cos(theta));
    const endY = Math.round(gcp.y + lineLength * Math.sin(theta));

    if (ct.name === names.cloud) {
        const cloudCurve = Math.floor(Math.random() * lineLength * lineWidth);
        drawLeafCluster(gardenContext, ct, gcp.x, gcp.y, cloudCurve, 1);
        drawLeafCluster(gardenContext, ct, endX, endY, cloudCurve, 1);
    } else {
        drawGenericLine(gardenContext, gcp.x, gcp.y, gardenContext.strokeStyle, lineWidth, endX, endY);
    }

    gcp.x = endX;
    gcp.y = endY;
}

/**
 * Clear the canvas, will also clear the ground - you will need to setup the canvas again
 */
function resetGardenCanvas() {
    const gardenCanvas = document.getElementById('gardenCanvas');
    resetLSystemCanvas(gardenCanvas, gardenCurrentPoint, gardenStashPoint, gardenMouse)
    $('#gardenSetupButton').attr('disabled', false);
    $('#gardenClearCanvasButton').attr('disabled', true);
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
function validateDynamicPlantIntegers(gcp, ct) {
    parseInt(gcp.degrees);
    parseInt(gcp.x);
    parseInt(gcp.y);
    parseInt(ct.degrees);
}

/**
 * Shoot settings setter
 */
function setBaseShootSettings(gcp, ct) {
    gcp.degrees = 270;
    ct.name = names.shoot;
    ct.rotationAngle = 20;
    ct.length = 5;
    ct.width = 1.5;
    ct.minAngle = 5;
    ct.maxAngle = 20;
    ct.minBranches = 0;
    ct.maxBranches = 1;
    ct.branchLength = 3;
    ct.stringLength = 12;
    ct.branchStartIndex = 5;
    ct.branchEndIndex = 10
}

/**
 * Grass settings setter
 */
function setBaseGrassSettings(gcp, ct) {
    gcp.degrees = 270;
    ct.name = names.grass;
    ct.rotationAngle = 5;
    ct.length = 2.5;
    ct.width = 1.5;
    ct.minAngle = 1;
    ct.maxAngle = 10;
    ct.minBranches = 0;
    ct.maxBranches = 0;
    ct.stringLength = 10;
    ct.branchStartIndex = 5;
    ct.branchEndIndex = 10;
}

/**
 * Cloud settings setter
 */
function setBaseCloudSettings(gcp, ct) {
    gcp.degrees = 0;
    ct.name = names.cloud;
    ct.rotationAngle = 15;
    ct.length = 5;
    ct.width = 5;
    ct.minAngle = 5;
    ct.maxAngle = 20;
    ct.minBranches = 0;
    ct.maxBranches = 2;
    ct.stringLength = 15;
    ct.branchStartIndex = 5;
    ct.branchEndIndex = 15;
    ct.leafMultiplier = 1.5
}

/**
 * Flower settings setter
 */
function setBaseFlowerSettings(gcp, ct) {
    gcp.degrees = 270;
    ct.name = names.flower;
    ct.rotationAngle = 15;
    ct.length = 3;
    ct.width = 2;
    ct.minAngle = 5;
    ct.maxAngle = 20;
    ct.minBranches = 1;
    ct.maxBranches = 3;
    ct.branchLength = 4;
    ct.stringLength = 15;
    ct.branchStartIndex = 8;
    ct.branchEndIndex = 13;
    ct.leafMultiplier = 1.2
}

function setBaseTreeSettings(gcp, ct) {
    gcp.degrees = 270;
    ct.name = names.tree;
    ct.rotationAngle = 20;
    ct.length = 10;
    ct.width = 25;
    ct.minAngle = 10;
    ct.maxAngle = 40;
    ct.minBranches = 10;
    ct.maxBranches = 15;
    ct.stringLength = 40;
    ct.branchLength = 15;
    ct.branchStartIndex = 10;
    ct.branchEndIndex = 35;
    ct.leafMultiplier = 4;
}

