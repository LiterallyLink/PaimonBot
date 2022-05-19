const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const emotes = require('../../assets/other/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Claim your daily primogems and mora!'),
	async run({ paimonClient, application }) {
		const user = await paimonClient.database.fetchPlayerData(application.user.id);

		const currentDate = new Date();

		const lastClaimedAt = user.dailyLastClaimedAt.toLocaleDateString('en-US');
		const toLocaleDateString = currentDate.toLocaleDateString('en-US');

		const alreadyClaimedDaily = lastClaimedAt === toLocaleDateString;

		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);

		const milisecondsUntilTomorrow = tomorrow - currentDate;
		const claimResetsIn = paimonClient.utils.formatMS(milisecondsUntilTomorrow);

		if (alreadyClaimedDaily) {
			const claimedDailyEmbed = new MessageEmbed()
				.setTitle('Wait Till Tomorrow!')
				.setDescription(`\nNext Daily Claim: \`${claimResetsIn}\``)
				.setFooter({ text: 'Dailies reset at 12am UTC.' })
				.setColor('WHITE');
			return application.followUp({ embeds: [claimedDailyEmbed] });
		}

		const dayLastClaimed = user.dailyLastClaimedAt.getDate();
		const currentDay = currentDate.getDate();
		const daysSinceLastClaimed = Math.abs(currentDay - dayLastClaimed);

		const streakMultiplier = daysSinceLastClaimed > 1 || daysSinceLastClaimed === 0 ? 1 : user.dailyClaimedStreak + 1;

		const streak = 1 + (streakMultiplier / 10);
		const moraCount = 20000 * streak;

		await user.updateOne({
			$set: {
				dailyLastClaimedAt: new Date(),
				dailyClaimedStreak: streakMultiplier
			},
			$inc: {
				mora: moraCount,
				primogems: 160
			}
		});

		const paimonTreasure = new MessageAttachment('.\\assets\\images\\paimon\\paimonTreasure.png', 'paimonTreasure.png');
		const dailyEmbed = new MessageEmbed()
			.setTitle('Daily Rewards')
			.setDescription(`${emotes.mora} x${moraCount}\n${emotes.primogem} x160`)
			.addField('Streak', `x${streakMultiplier}`)
			.setThumbnail('attachment://paimonTreasure.png')
			.setFooter({ text: `Daily Resets In: ${claimResetsIn}` })
			.setColor('WHITE');
		return application.followUp({ embeds: [dailyEmbed], files: [paimonTreasure] });
	}
};
