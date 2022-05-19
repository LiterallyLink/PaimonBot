const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Provides the bots current ping.'),
	async run({ paimonClient, application }) {
		const msg = await application.followUp({ content: '_ _', fetchReply: true });

		const apiLatency = `\`${Math.round(paimonClient.ws.ping)}ms\``;
		const uptime = `\`${paimonClient.utils.formatMS(paimonClient.uptime)}\``;

		const files = fs.readdirSync('.\\assets\\images\\paimon');
		const randomFile = files[Math.floor(Math.random() * files.length)];

		const attachment = new MessageAttachment(`.\\assets\\images\\paimon\\${randomFile}`, `${randomFile}`);

		const pingResponseEmbed = new MessageEmbed()
			.setThumbnail(`attachment://${attachment.name}`)
			.setDescription(`Bot Latency: \`${msg.createdTimestamp - application.createdTimestamp}ms\`\nWS Latency: ${apiLatency}\n Uptime: ${uptime}`)
			.setColor('WHITE');
		return application.editReply({ content: '_ _', embeds: [pingResponseEmbed], files: [attachment] });
	}
};
