const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('domain')
		.setDescription('Retrieve information on specific domains'),
	async run({ paimonClient, application }) {
		console.log('domain');
	}
};
