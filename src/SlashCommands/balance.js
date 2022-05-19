const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const emotes = require('../../assets/other/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check your total mora and primogems.'),
	async run({ paimonClient, application }) {
		const { mora, primogems } = await paimonClient.database.fetchPlayerData(application.user.id);

		const balanceEmbed = new MessageEmbed()
			.setAuthor({ name: `${application.user.username}'s Balance`, iconURL: application.user.avatarURL() })
			.addField(`Total Mora (${emotes.mora})`, `${mora}`)
			.addField(`Total Primogems (${emotes.primogem})`, `${primogems}`)
			.setColor('WHITE');
		return application.followUp({ embeds: [balanceEmbed] });
	}
};
