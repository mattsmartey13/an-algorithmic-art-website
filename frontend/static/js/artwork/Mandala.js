import AbstractArtwork from "./AbstractArtwork.js";

export default class extends AbstractArtwork {
    constructor(params, artwork) {
        super(params, artwork);
        this.setImageTitle("Mandala")
    }

    async getHtml() {
        return `
          <head>
          <title>Mandala</title>
            <label>Points:</label>
            <input type='range' min='10' max='40' id='points' value='20'/>
            <canvas id='canvas' width='400' height='400' /> 
          </head>
        `;
    }

    async getArtwork() {
        const canv = document.getElementById('canvas');
        const contx = canv.getContext('2d');

        if (!canv.getContext) {
            return;
        }

        function drawImage() {
            contx.strokeStyle = "blue";
            contx.fillStyle = "pink";
            //points value in this particular moment
            const point_count = document.getElementById('points').value;
            const radius = canv.width / 2;
            const points = []
            for (let i = 0; i <= point_count; i++) {
                //the more points, the tighter the angle between each line
                const angle = i * 2 * Math.PI / point_count - Math.PI / 2;
                points.push({
                    'x': radius + radius * Math.cos(angle),
                    'y': radius + radius * Math.sin(angle)
                });
            }
            contx.clearRect(0, 0, canv.width, canv.height);
            contx.beginPath();
            contx.lineWidth = 1;
            for (let i = 0; i < points.length; i++) {
                for (let j = 0; j < points.length; j++) {
                    contx.moveTo(points[i].x, points[i].y);
                    contx.lineTo(points[j].x, points[j].y);
                }
            }
            contx.stroke();
        }
        drawImage();
        document.getElementById('points').oninput = drawImage;

        return document.body.appendChild(drawImage);
    }
}