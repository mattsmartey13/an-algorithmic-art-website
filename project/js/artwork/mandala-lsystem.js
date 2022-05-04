/**
 * Ensure current point values are integers
 * @param mcp
 */
function validateMandalaIntInputs(mcp) {
    parseInt(mcp.x);
    parseInt(mcp.y);
    parseInt(mcp.degrees);
}

/**
 * Main method to draw mandala, range will create a layering effect by increasing the line length by 1 for each iteration
 */
function drawLSystemMandala() {
    const mandalaCanvas = document.getElementById('mandalaLSystemCanvas');
    const mandalaContext = mandalaCanvas.getContext("2d");
    const rect = mandalaCanvas.getBoundingClientRect();

    mandalaContext.clearRect(0, 0, mandalaCanvas.width, mandalaCanvas.height);
    mandalaContext.save();

    const mcp = {
        'x': 0,
        'y': 0,
        'degrees': 0
    }

    const msp = {
        'x': 0,
        'y': 0,
        'degrees': 0
    }

    const md = returnMandalaData();
    md.kinkEndIndex = md.mainStringLength - md.kinkStartIndex;
    setMandalaCanvasColourGradient(md)

    mcp.x = rect.width / 2;
    mcp.y = rect.height / 2;

    validateMandalaIntInputs(mcp);

    const circleCenter = drawCircleReturnCenter(mandalaContext, mcp, md);
    const angleGap = () => 360 / md.spawns;
    const endCoordinates = [];

    for (let i = 0; i < md.range; i++) {
        for (let j = 0; j < md.spawns; j++) {
            mcp.degrees = j * angleGap();
            mcp.x = setCircleXCoordinate(circleCenter.x, md.circleRadius, degreeToRadian(mcp.degrees))
            mcp.y = setCircleYCoordinate(circleCenter.y, md.circleRadius, degreeToRadian(mcp.degrees));
            const spawn = generateMandalaString(md.mainStringLength, md.kinkStartIndex, md.kinkEndIndex, md.branchNumber);
            processMandalaString(mandalaContext, spawn, mcp, msp, md, endCoordinates);
        }

        drawLayerEdges(mandalaContext, md, endCoordinates);

        for(let j = 0; j < md.spawns; j++) {
            endCoordinates.shift();
        }

        md.lineLength++;
    }
}

/**
 * Rules for each individual inside the Mandala L-system array
 * Notice [+] and [-] will create a branch at the rotated angle from the main string
 * Push to an array the endpoint of the main string - these endpoints will be then connected
 * to one another with lines to form a "mandala".
 * @param context
 * @param string
 * @param mcp
 * @param msp
 * @param md
 * @param endCoordinates
 */
function processMandalaString(context, string, mcp, msp, md, endCoordinates) {
    let branch;
    for (let character of string) {
        switch (character) {
            case "F":
                const theta = degreeToRadian(mcp.degrees)
                const end = getEndpoints(mcp.x, mcp.y, md.lineLength, theta)
                drawGenericLine(context, mcp.x, mcp.y, md.mandalaLineColor, md.lineWidth, end.x, end.y)
                mcp.x = end.x;
                mcp.y = end.y;
                break;
            case "+":
                rotatePointDirection(true, md.rotationAngle, mcp)
                break;
            case "-":
                rotatePointDirection(false, md.rotationAngle, mcp);
                break;
            case "[+]":
                setPointFromPoint(msp, mcp.x, mcp.y, mcp.degrees);
                rotatePointDirection(true, md.rotationAngle, msp)
                branch = generateRandomisedLSystemString(Math.floor(md.branchLength), (Math.floor(2)))
                processMandalaString(context, branch, msp, msp, md)
                break;
            case "[-]":
                setPointFromPoint(msp, mcp.x, mcp.y, mcp.degrees);
                rotatePointDirection(false, md.rotationAngle, msp)
                branch = generateRandomisedLSystemString(Math.floor(md.branchLength), (Math.floor(2)))
                processMandalaString(context, branch, msp, mcp, md)
                break;
        }
    }

    if (endCoordinates !== undefined) {
        endCoordinates.push([mcp.x, mcp.y]);
    }
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
    for (let i = 0; i < mainStringLength; i++) {
        ruleArray.push(lSystemLanguage[0]);
    }

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

        const branchIndexes = setRandomBranchIndexes(startIndex, endIndex, numberBranches);
        branchIndexes.map(insertBranchPair)
    }

    return ruleArray;
}

/**
 * Draw a circle with current point as centre and radius as listed in mandala data, return the center point.
 * @param context
 * @param mcp
 * @param md
 * @returns {{x, y}}
 */
function drawCircleReturnCenter(context, mcp, md) {
    const circleCenter =
        {x: mcp.x, y: mcp.y}

    context.beginPath();
    context.arc(circleCenter.x, circleCenter.y, md.circleRadius, 0, 2 * Math.PI, false);
    context.lineWidth = md.lineWidth
    context.strokeStyle = md.mandalaLineColor;
    context.stroke();

    return circleCenter;
}

/**
 * Used to connect the endpoints from the mandala's primary structure strings.
 * @param context
 * @param md
 * @param endPoints
 */
function drawLayerEdges(context, md, endPoints) {
    for (let i = 0; i < endPoints.length; i++) {
        if (i !== endPoints.length - 1) {
            drawGenericLine(context, endPoints[i][0], endPoints[i][1], md.mandalaLineColor, md.lineWidth, endPoints[i + 1][0], endPoints[i + 1][1]);
        } else {
            drawGenericLine(context, endPoints[i][0], endPoints[i][1], md.mandalaLineColor, md.lineWidth, endPoints[0][0], endPoints[0][1]);
        }
    }
}

/**
 * Helper to get x value from a circle based on the radian angle
 * @param xValue
 * @param radius
 * @param radians
 * @returns {*}
 */
function setCircleXCoordinate(xValue, radius, radians) {
    return xValue + Math.cos(radians) * radius;
}

/**
 * Helper to get y value from a circle based on the radian angle
 * @param yValue
 * @param radius
 * @param radians
 * @returns {*}
 */
function setCircleYCoordinate(yValue, radius, radians) {
    return yValue + Math.sin(radians) * radius;
}

/**
 * Random mechanism to set the index of where branching occurs on the mandala main strings
 * @param startIndex
 * @param endIndex
 * @param numberBranches
 * @returns {*[]}
 */
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

/**
 * Mandala data in one function
 */
function returnMandalaData() {
    return {
        'lineLength': parseInt($("#lSystemMandalaLineLength").val()),
        'lineWidth': parseInt($("#lSystemMandalaLineWidth").val()),
        'circleRadius': parseInt($("#lSystemMandalaCircleRadius").val()),
        'spawns': parseInt($("#lSystemMandalaSpawns").val()),
        'mainStringLength': parseInt($("#lSystemMandalaMainStringLength").val()),
        'branchNumber': parseInt($("#lSystemMandalaBranchNumber").val()),
        'branchLength': parseInt($("#lSystemMandalaBranchLength").val()),
        'range': parseInt($("#lSystemMandalaRange").val()),
        'mandalaLineColor': $("#lSystemMandalaLineColour").val(),
        'gradientColour1': $("#lSystemMandalaColour1").val(),
        'gradientColour2': $("#lSystemMandalaColour2").val(),
        'kinkStartIndex': 2,
        'rotationAngle': 15,
    }
}








