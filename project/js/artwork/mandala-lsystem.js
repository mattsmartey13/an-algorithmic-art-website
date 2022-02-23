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

const mandalaMouse = {
    x: 0,
    y: 0
};

function setMandalaStashPoint(x, y, degrees) {
    mandalaStashPoint.x = x;
    mandalaStashPoint.y = y;
    mandalaStashPoint.degrees = degrees;
}

function restoreMandalaCurrentPoint(x, y, degrees) {
    mandalaCurrentPoint.x = x;
    mandalaCurrentPoint.y = y;
    mandalaCurrentPoint.degrees = degrees;
}

/**
 * On canvas scroll custom event handler
 */
function mandalaCanvasOnMouseOver() {
    const mandalaCanvas = document.getElementById('mandalaLSystemCanvas');
    let mandalaCanvasRect = mandalaCanvas.getBoundingClientRect();
    $("#mandalaMouseFloatX").html("X: " + Math.round((event.clientX - mandalaCanvasRect.left) / (mandalaCanvasRect.right - mandalaCanvasRect.left) * mandalaCanvas.width));
    $("#mandalaMouseFloatY").html("Y: " + Math.round((event.clientY - mandalaCanvasRect.top) / (mandalaCanvasRect.bottom - mandalaCanvasRect.top) * mandalaCanvas.height));
}

/**
 * Onclick custom event handler
 * @param event
 */
function mandalaCanvasOnClick(event) {
    const mandalaCanvas = document.getElementById('mandalaLSystemCanvas');
    let mandalaCanvasRect = mandalaCanvas.getBoundingClientRect();
    mandalaMouse.x = Math.round((event.clientX - mandalaCanvasRect.left) / (mandalaCanvasRect.right - mandalaCanvasRect.left) * mandalaCanvas.width);
    mandalaMouse.y = Math.round((event.clientY - mandalaCanvasRect.top) / (mandalaCanvasRect.bottom - mandalaCanvasRect.top) * mandalaCanvas.height);
    mandalaCurrentPoint.x = mandalaMouse.x;
    mandalaCurrentPoint.y = mandalaMouse.y;
    $("#mandalaMouseX").html("X: " + mouse.x);
    $("#mandalaMouseY").html("Y: " + mouse.y);
}

function drawMandalaFractal(fractalString, lineLength, lineWidth, lineColour) {

}


