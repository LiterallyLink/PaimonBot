const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gadgets')
		.setDescription('Retrieve information on specific types of gadgets.'),
	async run({ paimonClient, application }) {
		console.log('gadgets');
	}
};
