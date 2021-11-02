let forward;

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function preAnimationDelay() {
    await sleep(500);
}

function drawMandala(point_count, lineColor) {
    const canvas = document.getElementById('mandalaCanvas')
    const context = canvas.getContext('2d');
    const radius = canvas.width / 2;
    const points = [];

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
        context.lineWidth = 1;

        for (let i = 0; i < points.length; i++) {
            for (let j = 0; j < points.length; j++) {
                context.moveTo(points[i].x, points[i].y);
                context.lineTo(points[j].x, points[j].y);
            }
        }
        context.strokeStyle = lineColor;
        context.closePath();
        context.stroke();
    }
}

function animateMandala() {
    let point_count = document.getElementById('mandalaPoints');
    let lineColor = document.getElementById('mandalaLineColor');
    let playBtn = document.getElementById('playMandala');

    playBtn.setAttribute('disabled', 'disabled');
    point_count.setAttribute('disabled', 'disabled');
    lineColor.setAttribute('disabled', 'disabled');

    forward = point_count.value < 40;

    if (forward) {
        preAnimationDelay().then(async () => {
            for (let i = point_count.value; i <= 40; i++) {
                await sleep(200);
                drawMandala(i, lineColor.value);
                point_count.value = i;
            }
            playBtn.removeAttribute('disabled');
            point_count.removeAttribute('disabled')
            lineColor.removeAttribute('disabled');
        });
    } else {
        preAnimationDelay().then(async () => {
            for (let i = point_count.value; i >= 20; i--) {
                await sleep(200);
                drawMandala(i, lineColor.value);
                point_count.value = i;
            }
            playBtn.removeAttribute('disabled');
            point_count.removeAttribute('disabled');
            lineColor.removeAttribute('disabled');
        })
    }
}
