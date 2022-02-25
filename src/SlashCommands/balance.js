const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { mora } = require('../../assets/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Shows your current balance'),
	async run({ paimonClient, application }) {
		const player = await paimonClient.database.fetchPlayerData(application.user.id);
		const moraCount = player.mora.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

		const balanceEmbed = new MessageEmbed()
			.setAuthor({ name: `${application.user.username}'s Balance`, iconURL: application.user.avatarURL() })
			.setDescription(`${mora} ${moraCount} Mora`)
			.setColor('WHITE');
		application.followUp({ embeds: [balanceEmbed] });
	}
};
