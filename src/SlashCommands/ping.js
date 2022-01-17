const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Provides the bots current ping.'),
	async run({ paimonClient, application }) {
		const msg = await application.followUp({ content: 'Pinging...', fetchReply: true });

		const apiLatency = `\`${Math.round(paimonClient.ws.ping)}ms\``;
		const uptime = `\`${paimonClient.utils.msToTime(paimonClient.uptime, { long: true })}\``;
		const attachment = new MessageAttachment('.\\assets\\images\\paimon\\alchoholicPaimon.webp', 'alchoholicPaimon.webp');

		const pingResponseEmbed = new MessageEmbed()
			.setThumbnail(`attachment://${attachment.name}`)
			.setDescription(`Bot Latency: \`${msg.createdTimestamp - application.createdTimestamp}ms\`\nWS Latency: ${apiLatency}\n Uptime: ${uptime}`)
			.setColor('WHITE');
		return application.editReply({ content: '_ _', embeds: [pingResponseEmbed], files: [attachment] });
	}
};
