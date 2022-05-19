const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('assets/font/zh-cn.ttf', { family: 'Zh-cn' });
const rankcards = require('../../assets/other/rankcards.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Provides rank information.')
		.addUserOption(option => option.setName('user').setDescription("The user you'd like to fetch the rank of."))
		.addStringOption(option => option.setName('card').setDescription('The card name')),
	async run({ paimonClient, application }) {
		const target = application.options.getUser('user') || application.user;

		const { xp, level } = await paimonClient.database.fetchMemberData(target.id, application.guild.id);

		const rank = await paimonClient.level.fetchRank(target.id, application.guild.id);
		const xpToNextLevel = await paimonClient.level.xpFor(level + 1);

		const canvasWidth = 930;
		const canvasHeight = 280;

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		// const { currentCard } = await paimonClient.database.fetchPlayerData(target.id);
		const currentCard = application.options.getString('card') || 'Default';
		const { name, embedColor, topBar, bottomBar, profileBackdrop, rankAndLevelStroke, rankAndLevelBars } = rankcards.find(card => card.name === currentCard);

		await this.createCanvasBackground(ctx, name);

		this.drawRankAndLevelGfx(ctx, rank, level, rankAndLevelBars, rankAndLevelStroke);
		this.drawProgress(ctx, xp, xpToNextLevel, topBar, bottomBar);
		this.drawUsername(ctx, target);
		await this.drawAvatar(ctx, target, profileBackdrop);

		const rankcardEmbed = new MessageEmbed()
			.setImage('attachment://rankCard.png')
			.setColor(embedColor);
		return application.followUp({ embeds: [rankcardEmbed], files: [{ attachment: canvas.toBuffer(), name: 'rankCard.png' }] });
	},

	async createCanvasBackground(ctx, card) {
		const rankCardBackground = await loadImage(`.\\assets\\images\\rankcards\\${card}.png`);
		ctx.drawImage(rankCardBackground, 0, 0, ctx.canvas.width, ctx.canvas.height);
	},

	drawUsername(ctx, member) {
		const xPos = 280;
		const yPos = 140;
		const name = member.username.length > 9 ? `${member.username.substring(0, 15)}...` : member.username;

		ctx.fillStyle = 'white';
		ctx.font = '38px "Zh-cn"';

		ctx.fillText(`${name}#${member.discriminator}`, xPos, yPos);
	},

	async drawAvatar(ctx, target, profileBackdrop) {
		const xPosition = 160;
		const yPosition = Math.round(ctx.canvas.height / 2);
		const radius = 100;

		ctx.fillStyle = profileBackdrop;
		ctx.strokeStyle = profileBackdrop;
		ctx.lineWidth = 8;

		ctx.beginPath();
		ctx.arc(xPosition, yPosition, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.clip();

		const avatar = await loadImage(target.displayAvatarURL({ format: 'png' }));

		ctx.drawImage(avatar, xPosition - radius, yPosition - radius, radius * 2, radius * 2);
		ctx.stroke();
		ctx.closePath();
	},

	drawProgress(ctx, currentXp, neededXp, topBarColor, bottomBarColor) {
		const totalXp = currentXp + neededXp;
		const xpPercentage = Math.floor((currentXp / totalXp) * 100);

		const barHeight = 40;
		const barWidth = 480;

		const topBarWidth = barWidth * xpPercentage / 100;

		const barXPosition = 270;
		const barYPosition = 160;

		this.drawBar(ctx, barHeight, barWidth, barXPosition, barYPosition, bottomBarColor);

		if (xpPercentage > 0) {
			this.drawBar(ctx, barHeight, topBarWidth, barXPosition, barYPosition, topBarColor);
		}

		ctx.fillStyle = 'white';
		ctx.font = '25px Zh-cn';

		ctx.fillText(`${currentXp}/${totalXp}`, barXPosition, 230);
	},

	drawRankAndLevelGfx(ctx, rank, level, rankAndLevelBarColor, rankAndLevelStroke) {
		ctx.font = '28px "Zh-cn"';

		const textYPosition = 16;
		const text = [`RANK ${rank}`, `LEVEL ${level}`];

		let textXPosition = 500;

		for (let i = 0; i < text.length; i++) {
			const metrics = ctx.measureText(text[i]);
			const textWidth = metrics.width + metrics.actualBoundingBoxAscent;

			const barXPosition = textXPosition;
			const barYPosition = textYPosition;
			const barWidth = textWidth;
			const barHeight = 50;

			this.drawBar(ctx, barHeight, barWidth, barXPosition, barYPosition, rankAndLevelBarColor);

			ctx.strokeStyle = rankAndLevelStroke;
			ctx.lineWidth = 5;

			ctx.stroke();

			ctx.fillStyle = 'white';
			ctx.fillText(text[i], textXPosition + 10, (textYPosition * 3) + 5);
			textXPosition += metrics.width + (metrics.actualBoundingBoxAscent * 3);
		}
	},

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
};
