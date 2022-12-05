const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('paimons-bargains')
		.setDescription('A shop that offers various items for sale!'),
	async run({ paimonClient, application }) {
		console.log('paimons-bargains');
	}
};
