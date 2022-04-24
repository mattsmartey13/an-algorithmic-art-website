const dnaMouse = {
    x: 0,
    y: 0
}

const dnaCurrentPoint = {
    x: 0,
    y: 0,
    degrees: 33,
}

const dnaData = {
    adenineColour: "#007fff",
    thymineColour: "#F7CC43",
    guanineColour: "#00ff00",
    cytosineColour: "#ff0040",
    backboneColour: "#100AD0",
    backBoneLineWidth: 2,
    helixDistance: 0,
    helixLength: 15,
    basePairs: 2,
    iterations: 1
}

function dnaCanvasOnMouseOver(event) {
    const canvas = document.getElementById('lSystemDNACanvas');
    const coordinates = canvasOnMouseOver(canvas, event);
    $("#lSystemDNAMouseFloatX").html("X: " + coordinates.x);
    $("#lSystemDNAMouseFloatY").html("Y: " + coordinates.y);
}

function dnaCanvasOnMouseClick(event) {
    const canvas = document.getElementById('lSystemDNACanvas');
    canvasOnMouseClick(canvas, event, dnaCurrentPoint, dnaMouse);
    $("#lSystemDNAMouseX").html("X: " + dnaMouse.x);
    $("#lSystemDNAMouseY").html("Y: " + dnaMouse.y);
}

function resetDnaCanvas() {
    const canvas = document.getElementById('lSystemDNACanvas');
    resetLSystemCanvas(canvas, dnaCurrentPoint, dnaMouse);

}

function drawDoubleHelix() {
    const canvas = document.getElementById('lSystemDNACanvas');
    const context = canvas.getContext('2d');

    const iterations = $('#lSystemDNAIterations').val();
    const numberPairs = $('#lSystemDNABasePairs').val();
    const helixDistance = $('#lSystemDNAHelixDistance').val();
    const helixLength = $('#lSystemDNAHelixLength').val();
    const newValues = validatedDNAInputsArray(iterations, helixDistance, helixLength, numberPairs);
    setInputValues(dnaData, newValues[0], newValues[1], newValues[2], newValues[3]);

    const axiom = $('#lSystemDNAAxiom').val();
    const aBecomes = $('#lSystemDNAAdenineRec').val();
    const gBecomes = $('#lSystemDNAGuanineRec').val();

    const tBecomes = $('#lSystemDNAThymineRec').val();
    const cBecomes = $('#lSystemDNACytosineRec').val();

    const ogDNA = generateDNABasesBase(axiom, aBecomes, gBecomes, tBecomes, cBecomes, iterations);
    const OGDNAArray = groupArrayInSetsOfN(dnaData.basePairs, Array.from(generateDNABasesBase(axiom, aBecomes, gBecomes, tBecomes, cBecomes, iterations)));
    const parallel = groupArrayInSetsOfN(dnaData.basePairs, Array.from(createContemporaryDNAString(ogDNA)));
    const t = (1 / dnaData.basePairs.toFixed(2));
    for (let i = 0; i < OGDNAArray.length; i++)
        drawDNASection(context, dnaData, t, OGDNAArray[i], parallel[i]);
}

function drawDNASection(context, dnaData, t, leftBases, rightBases) {
    const backBoneLeft = [], backBoneRight = []
    let start = {
        x: dnaCurrentPoint.x,
        y: dnaCurrentPoint.y,
        degrees: dnaCurrentPoint.degrees
    }

    const theta = degreeToRadian(start.degrees);
    const end = getEndpoints(start.x, start.y, dnaData.helixLength, theta)
    end.degrees = start.degrees;

    let rightBezierStart, rightBezierEnd, leftBezierStart, leftBezierEnd;
    if (start.degrees >= 180 && start.degrees <= 359) {
        rightBezierStart = returnDNABezierPoint(start.x, start.y, start.degrees, 0, dnaData.helixDistance);
        rightBezierEnd = returnDNABezierPoint(end.x, end.y, end.degrees, 0, dnaData.helixDistance);
        leftBezierStart = returnDNABezierPoint(start.x, start.y, start.degrees, 1, dnaData.helixDistance);
        leftBezierEnd = returnDNABezierPoint(end.x, end.y, end.degrees, 1, dnaData.helixDistance);
    } else {
        rightBezierStart = returnDNABezierPoint(start.x, start.y, start.degrees, 1, dnaData.helixDistance);
        rightBezierEnd = returnDNABezierPoint(end.x, end.y, end.degrees, 1, dnaData.helixDistance);
        leftBezierStart = returnDNABezierPoint(start.x, start.y, start.degrees, 0, dnaData.helixDistance);
        leftBezierEnd = returnDNABezierPoint(end.x, end.y, end.degrees, 0, dnaData.helixDistance);
    }

    drawGenericBezierCurve(context, dnaData.backboneColour, dnaData.backBoneLineWidth, start, end, rightBezierStart, rightBezierEnd);
    drawGenericBezierCurve(context, dnaData.backboneColour, dnaData.backBoneLineWidth, start, end, leftBezierStart, leftBezierEnd);

    let tempT = t;
    for (let i = 0; i < dnaData.basePairs; i++) {
        backBoneRight.push(
            getBezierXY(
                tempT, start.x, start.y, rightBezierStart.x, rightBezierStart.y, rightBezierEnd.x, rightBezierEnd.y, end.x, end.y
            )
        );

        backBoneLeft.push(
            getBezierXY(
                tempT, start.x, start.y, leftBezierStart.x, leftBezierStart.y, leftBezierEnd.x, leftBezierEnd.y, end.x, end.y
            )
        );

        const midway = getMidwayCoordinate(backBoneRight[i], backBoneLeft[i]);
        drawDNABase(context, rightBases[i], backBoneRight[i], dnaData.backBoneLineWidth, midway)
        drawDNABase(context, leftBases[i], backBoneLeft[i], dnaData.backBoneLineWidth, midway)
        tempT += t;
    }

    dnaCurrentPoint.x = end.x;
    dnaCurrentPoint.y = end.y;
    dnaCurrentPoint.degrees = end.degrees;
}

/**
 * Calculating coordinates along a cubic bézier curve
 * http://www.independent-software.com/determining-coordinates-on-a-html-canvas-bezier-curve.html
 * @param t
 * @param startX
 * @param startY
 * @param controlPoint1X
 * @param controlPoint1Y
 * @param controlPoint2X
 * @param controlPoint2Y
 * @param endX
 * @param endY
 * @returns {{x: number, y: number}}
 */
function getBezierXY(t, startX, startY, controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY) {
    return {
        x: Math.pow(1-t,3) * startX + 3 * t * Math.pow(1 - t, 2) * controlPoint1X
            + 3 * t * t * (1 - t) * controlPoint2X + t * t * t * endX,
        y: Math.pow(1-t,3) * startY + 3 * t * Math.pow(1 - t, 2) * controlPoint1Y
            + 3 * t * t * (1 - t) * controlPoint2Y + t * t * t * endY
    };
}

function generateDNABasesBase(axiom, aRule, cRule, tRule, gRule, iterations) {
    let fullString = "";
    fullString += axiom;

    for (let i = 0; i < iterations; i++) {
        fullString += DNALSystemCompute(fullString, aRule, gRule, tRule, cRule)
    }

    return fullString;
}

function DNALSystemCompute(string, aRule, gRule, tRule, cRule) {
    let newString = "";
    for (let character of string) {
        switch (character) {
            case "A":
                newString += aRule;
                break;
            case "G":
                newString += gRule;
                break;
            case "T":
                newString += tRule;
                break;
            case "C":
                newString += cRule;
                break;
            default:
                break;
        }
    }
    return newString;
}

function createContemporaryDNAString(OGDNAArray) {
    let newString = "";

    for (let character of OGDNAArray) {
        switch (character) {
            case "A":
                newString += "T";
                break;
            case "G":
                newString += "C";
                break;
            case "T":
                newString += "A";
                break;
            case "C":
                newString += "G";
                break;
            default:
                break;
        }
    }
    return newString;
}

function drawDNABase(context, base, startXY, lineWidth, endXY) {
    const colour = () => {
        switch (base) {
            case "A":
                return dnaData.adenineColour;
            case "G":
                return dnaData.guanineColour;
            case "T":
                return dnaData.thymineColour;
            case "C":
                return dnaData.cytosineColour;
            default:
                return "#000000";
        }
    }
    drawGenericLine(context, startXY.x, startXY.y, colour(), lineWidth, endXY.x, endXY.y);
}

/**
 * Create a control point, to be used in the creation of a bezier curve
 * @param x
 * @param y
 * @param degrees
 * @param dir
 * @param helixDistance
 * @returns {{x: number, y: number}}
 */
function returnDNABezierPoint(x, y, degrees, dir, helixDistance) {
    let theta;
    if (dir === 0) {
        if (degrees + 90 < 360) {
            theta = degreeToRadian(degrees + 90);
        } else {
            theta = degreeToRadian(((degrees - 360) + 90))
        }
    } else {
        if (degrees - 90 > 0) {
            theta = degreeToRadian(degrees - 90);
        } else {
            theta = degreeToRadian(((degrees - 90) + 360))
        }
    }
    return getEndpoints(x, y, helixDistance * 2, theta)
}

function setIterationsNumber(value) {
    dnaData.iterations = value;
}

function setHelixDistance(value) {
    dnaData.helixDistance = value;
}

function setHelixLength(value) {
    dnaData.helixLength = value;
}

function setInputValues(dnaDataObj, iterations, helixDistance, helixLength, basePairsPerSection) {
    dnaDataObj.adenineColour = document.getElementById('lSystemDNAAdenine').value
    dnaDataObj.thymineColour = document.getElementById('lSystemDNAThymine').value
    dnaDataObj.guanineColour = document.getElementById('lSystemDNAGuanine').value
    dnaDataObj.cytosineColour = document.getElementById('lSystemDNACytosine').value

    setIterationsNumber(iterations);
    setHelixDistance(helixDistance);
    setHelixLength(helixLength);
    setDNABasePairsPerSection(basePairsPerSection)
}

function validatedDNAInputsArray(iterations, helixDistance, helixLength, basePairs) {
    return [parseInt(iterations), parseInt(helixDistance), parseInt(helixLength), parseInt(basePairs)];
}

function setDNABasePairsPerSection(value) {
    dnaData.basePairs = value + 1;
}