module.exports = class Canvas {

	constructor(client) {
		this.client = client;
	}

	drawBar(ctx, barHeight, barWidth, barXPosition, barYPosition, color) {
		ctx.beginPath();
		ctx.arc((barHeight / 2) + barXPosition, (barHeight / 2) + barYPosition, barHeight / 2, Math.PI / 2, 3 / 2 * Math.PI);
		ctx.lineTo(barWidth - barHeight + barXPosition, 0 + barYPosition);
		ctx.arc(barWidth - (barHeight / 2) + barXPosition, (barHeight / 2) + barYPosition, barHeight / 2, 3 / 2 * Math.PI, Math.PI / 2);
		ctx.lineTo((barHeight / 2) + barXPosition, barHeight + barYPosition);

		ctx.fillStyle = color;
		ctx.fill();

		ctx.closePath();
	}

	addStroke(ctx, color, lineWidth) {
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;

		ctx.stroke();
	}

};
