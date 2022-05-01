const dnaMouse = {
    x: 0,
    y: 0
}

const dnaCurrentPoint = {
    x: 0,
    y: 0,
    degrees: 0,
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
    iterations: 1,
    axiom: "A",
    aRule: "TCA",
    gRule: "ATG",
    tRule: "CGA",
    cRule: "AAC"
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

function resetDnaCanvas(dcp, dm) {
    const canvas = document.getElementById('lSystemDNACanvas');
    resetLSystemCanvas(canvas, dcp, dm);

}

function drawDoubleHelix(dnaData, dcp) {
    const canvas = document.getElementById('lSystemDNACanvas');
    const context = canvas.getContext('2d');

    setInputValues(dnaData);

    const ogDNA = returnDNASingleStrand(dnaData);
    const ogDNAArray = groupArrayInSetsOfN(dnaData.basePairs, Array.from(ogDNA));
    const parallel = groupArrayInSetsOfN(dnaData.basePairs, Array.from(createParallelDNAStrand(ogDNA)));
    const t = (1 / dnaData.basePairs.toFixed(2));

    for (let i = 0; i < ogDNAArray.length; i++)
        drawDNASection(context, dcp, dnaData, t, ogDNAArray[i], parallel[i]);
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

    drawGenericBezierCurve(context, dnaData.backboneColour, dnaData.backBoneLineWidth, dcp, end, rightBezierStart, rightBezierEnd);
    drawGenericBezierCurve(context, dnaData.backboneColour, dnaData.backBoneLineWidth, dcp, end, leftBezierStart, leftBezierEnd);

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

function returnDNASingleStrand(dnaData) {
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

function setInputValues(dnaData) {
    dnaData.adenineColour = $('#lSystemDNAAdenine').val();
    dnaData.thymineColour = $('#lSystemDNAThymine').val();
    dnaData.guanineColour = $('#lSystemDNAGuanine').val();
    dnaData.cytosineColour = $('#lSystemDNACytosine').val();
    dnaData.iterations = parseInt($("#lSystemDNAIterations").val());
    dnaData.basePairs = parseInt($("#lSystemDNABasePairs").val());
    dnaData.helixDistance = parseInt(($("#lSystemDNAHelixDistance")).val())
    dnaData.helixLength = parseInt(($("#lSystemDNAHelixLength")).val())
    dnaData.axiom = $("#lSystemDNAAxiom").val();
    dnaData.aRule = $("#lSystemDNAAdenineRec").val();
    dnaData.gRule = $("#lSystemDNAGuanineRec").val();
    dnaData.tRule = $("#lSystemDNAThymineRec").val();
    dnaData.cRule = $("#lSystemDNACytosineRec").val();
}