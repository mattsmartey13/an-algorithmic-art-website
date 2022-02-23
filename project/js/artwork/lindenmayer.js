function drawLindenmayer(startX, startY, len, angle, branchWidth) {
    const canvas = document.getElementById('lindenmayer1canvas');
    const context = canvas.getContext('2d');

    //setup
    context.lineWidth = branchWidth;
    context.strokeStyle = "dark brown";
    context.fillStyle = "orchid";
    context.shadowBlur = 15;
    context.shadowColor = "rgba(0,0,0,0.8)";

    //create two distinct paths at the end of the trunk
    //"initial state"
    context.beginPath();
    context.save();

    context.translate(startX, startY);
    context.rotate(angle * Math.PI / 180);
    context.moveTo(0, 0);
    if (angle > 0) {
        context.bezierCurveTo(10, -len / 2, 10, -len / 2, 0, -len);
    } else {
        context.bezierCurveTo(-10, -len / 2, -10, -len / 2, 0, -len);
    }
    context.stroke();

    //go back to initial state - one branch with two heads
    //if len is too small
    //this also will determine the number of branches stemming off the main
    if (len < 5) {
        context.beginPath();
        //leaves use arc & fill methods (circle slices)
        context.arc(0, -len, 10, 0, Math.PI / 2);
        context.fill();
        context.restore();
        return;
    }
    //recursive call to create left & right branches 10 deg to side
    //shrink len and branch width by 20% each time
    drawLindenmayer(0, -len, len * 0.8, angle + 10, branchWidth * 0.8);
    drawLindenmayer(0, -len, len * 0.8, angle - 10, branchWidth * 0.8);

    //final branches are a copy of the original state
    //once branch is drawn start process again
    context.restore();
}