const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('assets/fonts/zh-cn.ttf', { family: 'Zh-cn' });
const listOfNamecards = require('../../assets/data/other/namecards.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Provides rank information.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the card.')),
	async run({ paimonClient, application }) {
		const canvasWidth = 930;
		const canvasHeight = 280;

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');
		const cardName = application.options.getString('name');

		const { name, embedColor, topBar, bottomBar, profileBackdrop, rankAndLevelStroke, rankAndLevelBars } = listOfNamecards.find(card => card.name === cardName) || listOfNamecards[1];

		await this.createCanvasBackground(ctx, name);
		this.drawRankAndLevelGfx(ctx, paimonClient, rankAndLevelBars, rankAndLevelStroke);

		const target = application.user;
		this.drawUsername(ctx, target);

		this.drawProgress(ctx, 100, 200, topBar, bottomBar, paimonClient);
		await this.drawAvatar(ctx, target, profileBackdrop);

		const rankcardEmbed = new MessageEmbed()
			.setImage('attachment://rankCard.png')
			.setColor(embedColor);
		return application.followUp({ embeds: [rankcardEmbed], files: [{ attachment: canvas.toBuffer(), name: 'rankCard.png' }] });
	},

	async createCanvasBackground(ctx, card) {
		const rankCardBackground = await loadImage(`.\\assets\\images\\namecards\\${card}.png`);
		ctx.drawImage(rankCardBackground, 0, 0, ctx.canvas.width, ctx.canvas.height);
	},

	drawRankAndLevelGfx(ctx, client, rankAndLevelBarColor, rankAndLevelStroke) {
		ctx.font = '28px "Zh-cn"';
		const textYPosition = 16;
		const text = [`RANK 20`, `LEVEL 2`];
		let textXPosition = 550;

		for (let i = 0; i < text.length; i++) {
			const metrics = ctx.measureText(text[i]);
			const textWidth = metrics.width + metrics.actualBoundingBoxAscent;

			const barXPosition = textXPosition;
			const barYPosition = textYPosition;
			const barWidth = textWidth;
			const barHeight = 50;

			client.canvas.drawBar(ctx, barHeight, barWidth, barXPosition, barYPosition, rankAndLevelBarColor);
			client.canvas.addStroke(ctx, rankAndLevelStroke, 5);

			ctx.fillStyle = 'white';
			ctx.fillText(text[i], textXPosition + 10, (textYPosition * 3) + 5);
			textXPosition += metrics.width + (metrics.actualBoundingBoxAscent * 3);
		}
	},

	drawUsername(ctx, member) {
		ctx.fillStyle = 'white';
		ctx.font = '38px "Zh-cn"';
		const xPos = 279;
		const yPos = 140;
		const name = member.username.length > 9 ? `${member.username.substring(0, 10)}...` : member.username;
		ctx.fillText(`${name}#${member.discriminator}`, xPos, yPos);
	},

	drawProgress(ctx, currentXp, neededXp, topBarColor, bottomBarColor, client) {
		const totalXp = currentXp + neededXp;
		const xpPercentage = Math.floor((currentXp / totalXp) * 100);

		const barHeight = 40;
		const barWidth = 480;
		const barWidth2 = barWidth * xpPercentage / 100;
		const barXPosition = 270;
		const barYPosition = 160;

		client.canvas.drawBar(ctx, barHeight, barWidth, barXPosition, barYPosition, bottomBarColor);
		client.canvas.drawBar(ctx, barHeight, barWidth2, barXPosition, barYPosition, topBarColor);

		ctx.fillStyle = 'white';
		ctx.font = '25px Zh-cn';
		ctx.fillText(`${client.utils.abbreviateNumber(currentXp)}/${client.utils.abbreviateNumber(totalXp)}`, 300, 230);
	},

	async drawAvatar(ctx, target, profileBackdrop) {
		const xPosition = 160;
		const yPosition = Math.round(ctx.canvas.height / 2);
		const radius = 100;

		ctx.beginPath();
		ctx.arc(xPosition, yPosition, radius, 0, Math.PI * 2);
		ctx.fillStyle = profileBackdrop;
		ctx.fill();

		ctx.clip();
		const avatar = await loadImage(target.displayAvatarURL({ format: 'png' }));
		ctx.drawImage(avatar, xPosition - radius, yPosition - radius, radius * 2, radius * 2);

		ctx.lineWidth = 8;
		ctx.stroke();
		ctx.closePath();
	}
};
