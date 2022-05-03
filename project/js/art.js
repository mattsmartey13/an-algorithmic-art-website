/**
 * Draw line
 * @param context
 * @param startX
 * @param startY
 * @param colour
 * @param lineWidth
 * @param endX
 * @param endY
 */
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
 * Draw bezier curve
 * @param context
 * @param colour
 * @param width
 * @param start
 * @param end
 * @param bezierStartPoint
 * @param bezierEndPoint
 */
function drawGenericBezierCurve(context, colour, width, start, end, bezierStartPoint, bezierEndPoint) {
    context.save();
    context.beginPath();
    context.strokeStyle = colour;
    context.lineWidth = width;
    context.moveTo(start.x, start.y);
    context.bezierCurveTo(bezierStartPoint.x, bezierStartPoint.y, bezierEndPoint.x, bezierEndPoint.y, end.x, end.y)
    context.stroke();
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

/**
 *
 * @param context
 * @param x
 * @param y
 * @param radius
 * @param counterClock
 */
function drawFilledCircle(context, x, y, radius, counterClock = false) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, counterClock);
    context.fill();
    context.closePath();
}

/**
 * Get the halfway point between two coordinates
 * @param start
 * @param end
 * @returns {{x: *, y: *}}
 */
function getMidwayCoordinate(start, end) {
    const x = start.x + (end.x - start.x) * 0.50;
    const y = start.y + (end.y - start.y) * 0.50;

    return { x, y };
}

/**
 * Use to set current point from stash point, and stash point from current point
 * @param point
 * @param x
 * @param y
 * @param degrees
 */
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
    const rect = canvas.getBoundingClientRect();

    if (mouse !== undefined) {
        currentPoint.x = mouse.x;
        currentPoint.y = mouse.y;
    } else {
        currentPoint.x = rect.width / 2
        currentPoint.y = rect.height / 2
    }

    if (stashPoint !== undefined) {
        stashPoint.x = 0;
        stashPoint.y = 0;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
}

/**
 * Degree to radian conversion necessary for drawing a line on the canvas
 * Degrees consider the orientation from oneself
 * Radians consider the arc length produced by that angle
 * @param degrees
 * @returns {number}
 */
function degreeToRadian(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Validator for angle property
 * @param angle
 * @returns {boolean}
 */
function validateAngle(angle) {
    return (angle < 360 && angle >= 0) === true;
}

/**
 * Random colour hex code getter
 * @returns {string}
 */
function getRandomColour() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * Return coordinates of mouse when mouse is going over the canvas
 * @param canvas
 * @param event
 * @returns {{x: number, y: number}}
 */
function canvasOnMouseOver(canvas, event) {
    let canvasRect = canvas.getBoundingClientRect();
    let x = Math.round((event.clientX - canvasRect.left) / (canvasRect.right - canvasRect.left) * canvas.width);
    let y = Math.round((event.clientY - canvasRect.top) / (canvasRect.bottom - canvasRect.top) * canvas.height);

    return {x, y};
}

/**
 * Return coordinates of mouse when mouse is clicking canvas, also sets current point to where mouse was clicked
 * @param canvas
 * @param event
 * @param currentPointVar
 * @param mouseVar
 */
function canvasOnMouseClick(canvas, event, currentPointVar, mouseVar) {
    const coordinates = canvasOnMouseOver(canvas, event);
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

/**
 * From start point, angle and line length, get the endpoint of the to-be line.
 * @param startX
 * @param startY
 * @param lineLength
 * @param theta
 * @returns {{x: number, y: number}}
 */
function getEndpoints(startX, startY, lineLength, theta) {
    const x = Math.round(startX + lineLength * Math.cos(theta));
    const y = Math.round(startY + lineLength * Math.sin(theta));

    return { x, y };
}

/**
 * Build canvas background gradient
 */
function setCanvasColourGradient(canvas, colour1, colour2) {
    const context = canvas.getContext("2d");
    const canvasRect = canvas.getBoundingClientRect();
    const grd = context.createLinearGradient(0, 0, canvasRect.width, canvasRect.height);
    grd.addColorStop(0, colour1);
    grd.addColorStop(1, colour2);
    context.fillStyle = grd;
    context.fillRect(0, 0, canvasRect.width, canvasRect.height);
}
