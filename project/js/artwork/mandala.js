/**
 * Delay function used as part of the mandala drawing at set time intervals
 * @param milliseconds
 * @returns {Promise<unknown>}
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**
 * Hardcoded half a second so the main function doesn't have to be async
 * @returns {Promise<void>}
 */
async function preAnimationDelay() {
    await sleep(500);
}

/**
 * Take number of points and use trigonometry to plot them on the canvas, then connect every point to one another
 */
function drawMandala() {
    const canvas = document.getElementById('mandalaCanvas');
    const context = canvas.getContext('2d');
    const radius = canvas.width / 2;
    const points = [];
    const point_count = $("#mandalaPoints").val();
    const line_color = $("#mandalaLineColor").val();

    for (let i = 0; i <= point_count; i++) {
        const angle = i * 2 * Math.PI / point_count - Math.PI / 2;
        points.push(
            {
                'x': radius + radius * Math.cos(angle),
                'y': radius + radius * Math.sin(angle)
            }
        );

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.lineWidth = 0.1;

        for (let i = 0; i < points.length; i++) {
            for (let j = 0; j < points.length; j++) {
                context.moveTo(points[i].x, points[i].y);
                context.lineTo(points[j].x, points[j].y);
            }
        }
        context.strokeStyle = line_color;
        context.closePath();
        context.stroke();
    }
}

/**
 * Use the preAnimationDelay() and drawMandala() methods to increment/decrement the number of points,
 * and redraw the mandala every half a second to create "pulsing" effect.
 */
function animateMandala() {
    const point_count = document.getElementById('mandalaPoints');
    const line_color = document.getElementById('mandalaLineColor');
    const playBtn = document.getElementById('playMandala');
    const forward = point_count.value < point_count.max;

    playBtn.setAttribute('disabled', 'disabled');
    point_count.setAttribute('disabled', 'disabled');
    line_color.setAttribute('disabled', 'disabled');

    if (forward) {
        preAnimationDelay().then(async () => {
            for (let i = point_count.value; i <= point_count.max; i++) {
                await sleep(200);
                drawMandala(i, line_color.value);
                point_count.value = i;
            }
            playBtn.removeAttribute('disabled');
            point_count.removeAttribute('disabled')
            line_color.removeAttribute('disabled');
        });
    } else {
        preAnimationDelay().then(async () => {
            for (let i = point_count.value; i >= point_count.min; i--) {
                await sleep(200);
                drawMandala(i, line_color.value);
                point_count.value = i;
            }
            playBtn.removeAttribute('disabled');
            point_count.removeAttribute('disabled');
            line_color.removeAttribute('disabled');
        })
    }
}
