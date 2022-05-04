function drawDoubleHelix() {
    const canvas = document.getElementById('lSystemDNACanvas');
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();

    const dnaData = returnDNAData();
    dnaData.helixLength = (canvas.width / 3) / dnaData.iterations;
    dnaData.helixDistance = dnaData.helixLength / 2;

    const ogDNA = returnDNAOriginalChain(dnaData);
    const ogDNAArray = groupArrayInSetsOfN(dnaData.basePairs, Array.from(ogDNA));
    const parallel = groupArrayInSetsOfN(dnaData.basePairs, Array.from(createParallelDNAStrand(ogDNA)));
    const t = (1 / dnaData.basePairs.toFixed(2));

    const dnaCurrentPoint = {
        'x': getStartingDNAXPoint(rect, ogDNAArray, dnaData),
        'y': getStartingDNAYPoint(rect, ogDNAArray, dnaData),
        'degrees': 0
    }

    for (let i = 0; i < ogDNAArray.length; i++) {
        if (dnaCurrentPoint.x > rect.width || dnaCurrentPoint.x < 0)
            moveDown(dnaCurrentPoint, dnaData, rect);

        drawDNASection(context, dnaCurrentPoint, dnaData, t, ogDNAArray[i], parallel[i]);
    }

}

function drawDNASection(context, dcp, dnaData, t, leftBases, rightBases) {
    const backBoneLeft = [], backBoneRight = []
    const theta = degreeToRadian(dcp.degrees);
    const end = getEndpoints(dcp.x, dcp.y, dnaData.helixLength, theta)
    end.degrees = dcp.degrees;

    let rightBezierStart, rightBezierEnd, leftBezierStart, leftBezierEnd;
    if (dcp.degrees >= 180 && dcp.degrees <= 359) {
        rightBezierStart = returnDNABezierPoint(dcp.x, dcp.y, dcp.degrees, 0, dnaData.helixDistance);
        rightBezierEnd = returnDNABezierPoint(end.x, end.y, end.degrees, 0, dnaData.helixDistance);
        leftBezierStart = returnDNABezierPoint(dcp.x, dcp.y, dcp.degrees, 1, dnaData.helixDistance);
        leftBezierEnd = returnDNABezierPoint(end.x, end.y, end.degrees, 1, dnaData.helixDistance);
    } else {
        rightBezierStart = returnDNABezierPoint(dcp.x, dcp.y, dcp.degrees, 1, dnaData.helixDistance);
        rightBezierEnd = returnDNABezierPoint(end.x, end.y, end.degrees, 1, dnaData.helixDistance);
        leftBezierStart = returnDNABezierPoint(dcp.x, dcp.y, dcp.degrees, 0, dnaData.helixDistance);
        leftBezierEnd = returnDNABezierPoint(end.x, end.y, end.degrees, 0, dnaData.helixDistance);
    }

    drawGenericBezierCurve(context, dnaData.backBoneColour, dnaData.lineWidth, dcp, end, rightBezierStart, rightBezierEnd);
    drawGenericBezierCurve(context, dnaData.backBoneColour, dnaData.lineWidth, dcp, end, leftBezierStart, leftBezierEnd);

    let tempT = t;
    for (let i = 0; i < dnaData.basePairs; i++) {
        backBoneRight.push(
            getBezierXY(
                tempT, dcp.x, dcp.y, rightBezierStart.x, rightBezierStart.y, rightBezierEnd.x, rightBezierEnd.y, end.x, end.y
            )
        );

        backBoneLeft.push(
            getBezierXY(
                tempT, dcp.x, dcp.y, leftBezierStart.x, leftBezierStart.y, leftBezierEnd.x, leftBezierEnd.y, end.x, end.y
            )
        );

        const midway = getMidwayCoordinate(backBoneRight[i], backBoneLeft[i]);
        drawDNABase(context, rightBases[i], backBoneRight[i], dnaData, midway)
        drawDNABase(context, leftBases[i], backBoneLeft[i], dnaData, midway)
        tempT += t;
    }

    dcp.x = end.x;
    dcp.y = end.y;
    dcp.degrees = end.degrees;
}

function moveDown(dcp, dnaData, rect) {
    dcp.y += (dnaData.helixLength * 1.5)

    if (dcp.degrees === 0) {
        dcp.x = rect.width
        dcp.degrees = 180;
    } else {
        dcp.x = 0;
        dcp.degrees = 0;
    }
}

function getStartingDNAXPoint(rect, ogDNAArray, dnaData) {
    if (ogDNAArray.length === 1)
        return (rect.width / 2) - dnaData.helixDistance;
    if (ogDNAArray.length === 2)
        return (rect.width / 3) - dnaData.helixDistance;
    if ((ogDNAArray.length * dnaData.helixDistance * dnaData.iterations) >= rect.width)
        return 0;
    else
        return (rect.width - (dnaData.helixDistance * ogDNAArray.length * dnaData.iterations)) / 2;
}

function getStartingDNAYPoint(rect, ogDNAArray, dnaData) {
    if ((ogDNAArray.length * dnaData.helixDistance * dnaData.iterations) > rect.width) {
        return dnaData.helixLength;
    } else {
        return rect.height / 2
    }
}

function returnDNAOriginalChain(dnaData) {
    let newString = dnaData.axiom;
    for (let i = 0; i < dnaData.iterations; i++) {
        for (let character of newString) {
            switch (character) {
                case "A":
                    newString += dnaData.aRule;
                    break;
                case "G":
                    newString += dnaData.gRule;
                    break;
                case "T":
                    newString += dnaData.tRule;
                    break;
                case "C":
                    newString += dnaData.cRule;
                    break;
                default:
                    break;
            }
        }
    }
    return newString;
}

function createParallelDNAStrand(OGDNAArray) {
    let string = "";
    for (let character of OGDNAArray) {
        switch (character) {
            case "A":
                string += "T";
                break;
            case "G":
                string += "C";
                break;
            case "T":
                string += "A";
                break;
            case "C":
                string += "G";
                break;
            default:
                break;
        }
    }
    return string;
}

function drawDNABase(context, base, startXY, dnaData, endXY) {
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
    drawGenericLine(context, startXY.x, startXY.y, colour(), dnaData.lineWidth, endXY.x, endXY.y);
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

function returnDNAData() {
    return {
        adenineColour: $('#lSystemDNAAdenine').val(),
        thymineColour: $('#lSystemDNAThymine').val(),
        guanineColour: $('#lSystemDNAGuanine').val(),
        cytosineColour: $('#lSystemDNACytosine').val(),
        backBoneColour: $('#lSystemDNABackboneColour').val(),
        iterations: parseInt($("#lSystemDNAIterations").val()),
        basePairs: parseInt($("#lSystemDNABasePairs").val()),
        lineWidth: parseInt($('#lSystemDNALineWidth').val()),
        axiom: $("#lSystemDNAAxiom").val(),
        aRule: $("#lSystemDNAAdenineRec").val(),
        gRule: $("#lSystemDNAGuanineRec").val(),
        tRule: $("#lSystemDNAThymineRec").val(),
        cRule: $("#lSystemDNACytosineRec").val()
    }
}