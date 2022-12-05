const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spiral-abyss')
		.setDescription('Retrieve information on specific floors of the spiral abyss.'),
	async run({ paimonClient, application }) {
		console.log('spiral abyss');
	}
};
