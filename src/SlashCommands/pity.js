const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pity')
		.setDescription("Allow's you to view your pity on all banner's"),
	async run({ paimonClient, application }) {
		const { pity } = await paimonClient.database.fetchPlayerData(application.user.id);

		const pityEmbed = new MessageEmbed()
			.setColor('WHITE');

		for (let i = 0; i < pity.length; i++) {
			const { type, fourStarPity, fiveStarPity, totalWishes } = pity[i];
			pityEmbed.addField(`${paimonClient.utils.capitalize(type)} Banner`, `Total Wishes: ${totalWishes}\n5✨ Pity: ${fiveStarPity}\n4✨ Pity: ${fourStarPity}`, true);
		}

		for (let i = 0; i < pity.length; i++) {
			const { wishHistory } = pity[i];
			const wishHistoryList = wishHistory.length ? wishHistory.slice(Math.max(wishHistory.length - 5, 0)).join('\n') : 'None';
			pityEmbed.addField(`Last 5 Wishes:`, `${wishHistoryList}`, true);
		}

		return application.followUp({ embeds: [pityEmbed] });
	}
};
