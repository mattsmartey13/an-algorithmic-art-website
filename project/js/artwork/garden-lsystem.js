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
}

/**
 * Uses the rule generator and interpreter to create our plant
 * Used when the canvas is set up and the user clicks the canvas
 */
function generateGardenComponent(gcp, gsp, ct, stringLength) {
    stringLength = randomNumberBetweenRange(stringLength / 2, stringLength)
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
 * @param length
 * @returns {*[]}
 */
function ruleGenerator(ct, length) {
    const gardenRuleArray = generateFractalString(length, ct.branchStartIndex);

    /**
     * Insert brackets where it is worthwhile to, based on the type's given likeliness.
     *
     * UPDATE AAWVJ36 - brackets slid in between our range points
     * Bracket then recursively calls another generateGardenComponent()
     */
    const currentBranches = randomNumberBetweenRange(ct.minBranches, ct.maxBranches);
    if (currentBranches > 0) {
        for (let i = 0; i < currentBranches; i++) {
            if (length > ct.branchStartIndex) {
                let branchIndex = randomNumberBetweenRange(ct.branchStartIndex, ct.branchEndIndex);
                gardenRuleArray.splice(branchIndex, 0, "[")
                gardenRuleArray.splice(branchIndex + 1, 0, "]");
                ct.branchStartIndex += 1;
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

    switch (typeName) {
        case "Flower":
            gardenContext.strokeStyle = "#446327";
            setBaseFlowerSettings();
            break;
        case "Tree":
            gardenContext.strokeStyle = "#6e4300";
            gardenContext.fillStyle = "#087000";
            setBaseTreeSettings();
            break;
        case "Shoot":
            gardenContext.strokeStyle = "#25523b";
            gardenContext.fillStyle = "#5aab61";
            setBaseShootSettings();
            break;
        case "Cloud":
            gardenContext.strokeStyle = "#A9B7B4";
            gardenContext.fillStyle = "#A9B7B4";
            setBaseCloudSettings();
            break;
        case "Grass":
            gardenContext.strokeStyle = "#348C31";
            gardenContext.fillStyle = "#348C31";
            setBaseGrassSettings();
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
    validateDynamicPlantIntegers();
    let index = 0;
    for (let character of gardenRuleArray) {
        index++;
        if (index % 5 === 0)
            ct.width *= 0.9;
        switch (character) {
            case 'F':
                const allLineIndexes = getAllIndexes(gardenRuleArray, 'F');
                const stemRangeFromPeak = (bottom, top) => {
                    return index - 1 >= allLineIndexes[allLineIndexes.length - bottom] && index - 1 <= allLineIndexes[allLineIndexes.length - top];
                }

                if (ct.name === names.tree && stemRangeFromPeak(2, 1)) {
                    drawLeafCluster(gardenContext, ct, gcp.x, gcp.y, ct.length * 3)
                }
                if (ct.name === names.flower && stemRangeFromPeak(2, 1)) {
                    gardenContext.fillStyle = returnRandomFlowerColour();
                    drawLeafCluster(gardenContext, ct, gcp.x, gcp.y, ct.length * 1.2)
                }
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
                let temp;
                ct.rotationAngle = randomNumberBetweenRange(ct.minAngle, ct.maxAngle)
                const angles = [gcp.degrees - ct.rotationAngle, gcp.degrees + ct.rotationAngle]
                const rand = Math.round(Math.random())
                if (rand === 0) {
                    temp = angles[0]
                    setPointFromPoint(gsp, gcp.x, gcp.y, temp);
                } else {
                    temp = angles[1]
                    setPointFromPoint(gsp, gcp.x, gcp.y, temp);
                }
                ct.length *= 0.8;

                generateGardenComponent(gsp, gcp, ct, ct.branchLength);
                if (ct.name === names.tree)
                    drawLeafCluster(gardenContext, ct, gsp.x, gsp.y, ct.length * 2)

                generateGardenComponent(gcp, gsp, ct, ct.branchLength);
                if (ct.name === names.tree)
                    drawLeafCluster(gardenContext, ct, gcp.x, gcp.y, ct.length * 2)
                break;
            case ']':
                setPointFromPoint(gcp, gsp.x, gsp.y, gsp.degrees);
                break;
        }
    }
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
    gardenSetup();
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
 * Shoot settings setter
 */
function setBaseShootSettings() {
    gardenCurrentPoint.degrees = 270;
    currentType.name = names.shoot;
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
    currentType.name = names.grass;
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
    currentType.name = names.cloud;
    currentType.rotationAngle = 15;
    currentType.length = 5;
    currentType.width = 5;
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
    currentType.name = names.flower;
    currentType.rotationAngle = 15;
    currentType.length = 3;
    currentType.width = 2;
    currentType.minAngle = 5;
    currentType.maxAngle = 20;
    currentType.minBranches = 1;
    currentType.maxBranches = 3;
    currentType.branchLength = 4;
    currentType.stringLength = 15;
    currentType.branchStartIndex = 8;
    currentType.branchEndIndex = 13;
}

function setBaseTreeSettings() {
    gardenCurrentPoint.degrees = 270;
    currentType.name = names.tree;
    currentType.rotationAngle = 20;
    currentType.length = 10;
    currentType.width = 25;
    currentType.minAngle = 10;
    currentType.maxAngle = 40;
    currentType.minBranches = 10;
    currentType.maxBranches = 15;
    currentType.branchLength = 15;
    currentType.stringLength = 40;
    currentType.branchStartIndex = 10;
    currentType.branchEndIndex = 35;
}

