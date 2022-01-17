const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { mora } = require('../../assets/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Earn your daily primogems and mora!'),
	async run({ paimonClient, application }) {
		const user = await paimonClient.database.fetchPlayerData(application.user.id);

		const lastClaimed = new Date(user.dailyLastClaimedAt);
		const currentDate = new Date(Date.now());

		if (currentDate.getDate() !== lastClaimed.getDate() || currentDate.getMonth() !== lastClaimed.getMonth() || currentDate.getYear() !== lastClaimed.getYear()) {
			await paimonClient.economy.daily(application.user.id);

			const attachment = new MessageAttachment('.\\assets\\images\\paimon\\paimonTreasure.png', 'paimonTreasure.png');

			const dailyClaimedEmbed = new MessageEmbed()
				.setAuthor({ name: 'Daily Claimed!', iconURL: application.user.displayAvatarURL({ dynamic: true }) })
				.setThumbnail(`attachment://${attachment.name}`)
				.setDescription(`+20,000 Mora ${mora}`)
				.setColor('WHITE');
			return application.followUp({ embeds: [dailyClaimedEmbed], files: [attachment] });
		} else {
			currentDate.setDate(currentDate.getDate() + 1);
			currentDate.setHours(0, 0, 0, 0);

			const msDifference = currentDate.getTime() - new Date(Date.now());

			const durationTillNextDaily = new MessageEmbed()
				.setDescription(`You've already claimed your daily for today!\nYou can claim your next daily in ${paimonClient.utils.msToTime(msDifference)}.`)
				.setFooter({ text: 'Dailies reset at 12am UTC' })
				.setColor('WHITE');
			return application.followUp({ embeds: [durationTillNextDaily] });
		}
	}
};
