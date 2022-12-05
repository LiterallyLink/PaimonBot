const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('elements')
		.setDescription('Retrieve information about specific elements and their reactions.'),
	async run({ paimonClient, application }) {
		console.log('elements');
	}
};
