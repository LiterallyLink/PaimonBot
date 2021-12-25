const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { paimonIsAnAlcholic } = require('../../assets/paimonImages.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Provides the bots current ping.'),
	async run({ paimonClient, application }) {
		const msg = await application.followUp({ content: 'Pinging...', fetchReply: true });

		const apiLatency = `\`${Math.round(paimonClient.ws.ping)}ms\``;
		const uptime = `\`${paimonClient.utils.msToTime(paimonClient.uptime, { long: true })}\``;

		const pingResponseEmbed = new MessageEmbed()
			.setThumbnail(paimonIsAnAlcholic)
			.setDescription(`Bot Latency: \`${msg.createdTimestamp - application.createdTimestamp}\`ms\nWS Latency: ${apiLatency}\n Uptime: ${uptime}`)
			.setColor('WHITE');
		return application.editReply({ content: '_ _', embeds: [pingResponseEmbed] });
	}
};
