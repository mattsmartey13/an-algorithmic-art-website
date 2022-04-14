const mandalaCurrentPoint = {
    'x': 0,
    'y': 0,
    'degrees': 0
}

const mandalaStashPoint = {
    'x': 0,
    'y': 0,
    'degrees': 0
}

let endCoordinates = [];

const mandalaData = {
    'rotationAngle': 15,
    'lineLength': 1,
    'lineWidth': 1,
    'circleRadius': 1,
    'spawns': 1,
    'mainStringLength': 1,
    'branchNumber': 1,
    'branchLength': 1,
    'kinkStartIndex': 2,
    'kinkEndIndex': 4,
    'lineColor': "#000000",
    'gradientColour1': "#801171",
    'gradientColour2': "#f1ff36",
}

function resetMandalaCanvas() {
    const mandalaCanvas = document.getElementById('mandalaLSystemCanvas');
    resetLSystemCanvas(mandalaCanvas, mandalaCurrentPoint, mandalaStashPoint);
}

function validateMandalaIntInputs() {
    parseInt(mandalaCurrentPoint.x);
    parseInt(mandalaCurrentPoint.y);
    parseInt(mandalaCurrentPoint.degrees);

    parseInt(mandalaStashPoint.x);
    parseInt(mandalaStashPoint.y);
    parseInt(mandalaStashPoint.degrees);
}

function drawLSystemMandala(mcp, msp, md) {
    const mandalaCanvas = document.getElementById('mandalaLSystemCanvas');
    const mandalaContext = mandalaCanvas.getContext("2d");
    const rect = mandalaCanvas.getBoundingClientRect();

    mcp.x = rect.width / 2;
    mcp.y = rect.height / 2;

    validateMandalaIntInputs(mcp, msp, md);
    mandalaOnInputs(md);

    const circleCenter = createCircleCenter(mandalaContext, mcp, md);
    const angleGap = () => 360 / md.spawns;
    const xCoordinates = setCircleXCoordinates(circleCenter.x, md.circleRadius, md.spawns);
    const yCoordinates = setCircleYCoordinates(circleCenter.y, md.circleRadius, md.spawns);

    const coordinates = () => {
        const coords = [];
        for (let i = 0; i < md.spawns; i++) {
            coords.push(Array(xCoordinates[i], yCoordinates[i]));
        }
        return coords;
    }

    for (let i = 0; i < coordinates().length; i++) {
        const spawn = generateMandalaString(md.mainStringLength, md.kinkStartIndex, md.kinkEndIndex, md.branchNumber);
        mcp.degrees = i * angleGap();
        mcp.x = coordinates()[i][0];
        mcp.y = coordinates()[i][1];
        processMandalaString(mandalaContext, spawn, mcp, msp, md);
    }

    drawLayerEdge(mandalaContext, md, endCoordinates);

    for (let i = 0; i < md.mainStringLength; i++) {
        endCoordinates.shift();
    }
}

function drawMandalaLine(context, mcp, md) {
    const theta = degreeToRadian(mcp.degrees);
    const endpoints = getEndpoints(mcp.x, mcp.y, md.lineLength, theta)
    drawGenericLine(context, mcp.x, mcp.y, md.lineColor, md.lineWidth, endpoints.endX, endpoints.endY);
    mcp.x = endpoints.endX;
    mcp.y = endpoints.endY;
}

function processMandalaString(context, string, mcp, msp, md) {
    let branch;
    for (let character of string) {
        switch (character) {
            case "F":
                drawMandalaLine(context, mcp, md);
                break;
            case "+":
                rotatePointDirection(true, md.rotationAngle, mcp)
                break;
            case "-":
                rotatePointDirection(false, md.rotationAngle, mcp);
                break;
            case "[+]":
                setPointFromPoint(msp, mcp.x, mcp.y, mcp.degrees);
                branch = generateFractalString(Math.floor(md.branchLength), (Math.floor(2)))
                rotatePointDirection(true, md.rotationAngle, mcp)
                processMandalaString(context, branch, mcp, msp, md)
                setPointFromPoint(mcp, msp.x, msp.y, msp.degrees);
                break;
            case "[-]":
                setPointFromPoint(msp, mcp.x, mcp.y, mcp.degrees);
                branch = generateFractalString(Math.floor(md.branchLength), 2)
                rotatePointDirection(false, md.rotationAngle, mcp)
                processMandalaString(context, branch, mcp, msp, md)
                setPointFromPoint(mcp, msp.x, msp.y, msp.degrees);
                break;
            case "[":
                setPointFromPoint(msp, mcp.x, mcp.y, mcp.degrees);
                break;
            case "]":
                setPointFromPoint(mcp, msp.x, msp.y, msp.degrees);
                break;
        }
    }

    if (string.includes("[+]") || string.includes("[-]"))
        endCoordinates.push([mcp.x, mcp.y]);
}

/**
 * Primary structure, one mandala string
 * @param mainStringLength
 * @param startIndex
 * @param endIndex
 * @param numberBranches
 * @returns {*[]}
 */
function generateMandalaString(mainStringLength, startIndex, endIndex, numberBranches) {
    let ruleArray = [];

    if (numberBranches > 0) {
        const insertBranchPair = (index) => {
            const rand = Math.ceil(Math.random() * 3);
            switch (rand) {
                case 1:
                    ruleArray.splice(index, 0, "[-]")
                    break;
                case 2:
                    ruleArray.splice(index, 0, "[+]")
                    break;
                case 3:
                    ruleArray.splice(index, 0, "[+]", "[-]")
            }
        }
        for (let i = 0; i < mainStringLength; i++) {
            ruleArray.push(lSystemLanguage[0]);
        }

        const branchIndexes = setRandomBranchIndexes(startIndex, endIndex, numberBranches);
        branchIndexes.map(insertBranchPair)
    } else {
        for (let i = 0; i < mainStringLength; i++) {
            ruleArray.push(lSystemLanguage[0]);
        }
    }

    return ruleArray;
}

function createCircleCenter(context, mcp, md) {
    const circleCenter =
        {x: mcp.x, y: mcp.y}

    context.beginPath();
    context.arc(circleCenter.x, circleCenter.y, md.circleRadius, 0, 2 * Math.PI, false);
    context.lineWidth = md.lineWidth
    context.strokeStyle = md.lineColor;
    context.stroke();

    return circleCenter;
}

function drawLayerEdge(context, md, endPoints) {
    for (let i = 0; i < endPoints.length; i++) {
        if (i !== endPoints.length - 1) {
            drawGenericLine(context, endPoints[i][0], endPoints[i][1], md.lineColor, md.lineWidth, endPoints[i + 1][0], endPoints[i + 1][1]);
        } else {
            drawGenericLine(context, endPoints[i][0], endPoints[i][1], md.lineColor, md.lineWidth, endPoints[0][0], endPoints[0][1]);
        }
    }
}

function setCircleXCoordinates(xValue, radius, spawns) {
    let xPoints = [];
    for (let i = 0; i < spawns; i++) {
        xPoints.push(xValue + radius * Math.cos(2 * Math.PI * i / spawns))
    }

    return xPoints;
}

function setCircleYCoordinates(yValue, radius, spawns) {
    let yPoints = [];
    for (let i = 0; i < spawns; i++) {
        yPoints.push(yValue + radius * Math.sin(2 * Math.PI * i / spawns))
    }

    return yPoints;
}

function setRandomBranchIndexes(startIndex, endIndex, numberBranches) {
    let branchIndexes = [];

    for (let i = 0; i < numberBranches; i++) {
        branchIndexes.push(randomNumberBetweenRange(startIndex, endIndex))
    }
    return branchIndexes;
}

/**
 * Build canvas background gradient
 */
function setMandalaCanvasColourGradient(md) {
    const canvas = document.getElementById("mandalaLSystemCanvas")
    const context = canvas.getContext("2d");
    const canvasRect = canvas.getBoundingClientRect();
    const grd = context.createLinearGradient(0, 0, canvasRect.width, canvasRect.height);
    grd.addColorStop(0, md.gradientColour1);
    grd.addColorStop(1, md.gradientColour2);
    context.fillStyle = grd;
    context.fillRect(0, 0, canvasRect.width, canvasRect.height);
}

function mandalaOnInputs(md) {
    changeColourGradient1(md);
    changeColourGradient2(md);
    changeCircleRadius(md);
    changeLineColor(md);
    changeLineLength(md);
    changeLineWidth(md);
    changeNumberSpawns(md);
    changeNumberSideBranches(md);
    changeSideBranchLength(md);
    changeMainBranchLength(md);
}

/**
 * Setter for gradient colour 1
 */
function changeColourGradient1(md) {
    md.gradientColour1 = document.getElementById("lSystemMandalaColour1").value;
}

/**
 * Setter for lineColor
 * @param md
 */
function changeLineColor(md) {
    md.lineColor = document.getElementById('lSystemMandalaLineColour').value;
}

/**
 * Setter for gradient colour 2
 * @param md
 */
function changeColourGradient2(md) {
    md.gradientColour2 = document.getElementById("lSystemMandalaColour2").value;
}

/**
 * Setter for lineLength
 * @param md
 */
function changeLineLength(md) {
    md.lineLength = parseInt(document.getElementById("lSystemMandalaLineLength").value);
}
/**
 * Setter for lineWidth
 * @param md
 */
function changeLineWidth(md) {
    md.lineWidth = parseInt(document.getElementById("lSystemMandalaLineWidth").value);
}

/**
 * Setter for circle radius
 * @param md
 */
function changeCircleRadius(md) {
    md.circleRadius = parseInt(document.getElementById('lSystemMandalaCircleRadius').value);
}

/**
 * Setter for number of branches stemming from circle
 * @param md
 */
function changeNumberSpawns(md) {
    md.spawns = parseInt(document.getElementById('lSystemMandalaSpawns').value);
}

/**
 * Setter for main branch length and where sides can grow
 * @param md
 */
function changeMainBranchLength(md) {
    md.mainStringLength = parseInt(document.getElementById('lSystemMandalaMainStringLength').value);
    md.kinkStartIndex = 2;
    md.kinkEndIndex = md.mainStringLength - md.branchLength;
}

/**
 * Setter for side branch length
 * @param md
 */
function changeSideBranchLength(md) {
    md.branchLength = parseInt(document.getElementById('lSystemMandalaBranchLength').value);
}

/**
 * Setter for number of side branches off a main branch
 * @param md
 */
function changeNumberSideBranches(md) {
    md.branchNumber = parseInt(document.getElementById('lSystemMandalaBranchNumber').value);
}




