const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { mora } = require('../../assets/emotes.json');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Earn your daily primogems and mora!'),
	async run({ paimonClient, application }) {
		const player = await paimonClient.database.fetchPlayerData(application.user.id);

		const currentDate = moment();
		const lastClaimedDate = moment(player.dailyLastClaimedAt);

		if (currentDate.isSame(lastClaimedDate, 'day')) {
			const tomorrowsDate = moment().add(1, 'days');
			tomorrowsDate.hour(0);
			tomorrowsDate.minute(0);
			tomorrowsDate.second(0);
			tomorrowsDate.millisecond(0);

			const msToNextDaily = tomorrowsDate.valueOf() - currentDate.valueOf();
			const msDifference = paimonClient.utils.msToTime(msToNextDaily);

			const nextClaimEmbed = new MessageEmbed()
				.setDescription(`You've already claimed your daily for today!\nYou can claim your next daily in ${msDifference}.`)
				.setFooter({ text: 'Dailies reset at 12am UTC' })
				.setColor('WHITE');
			return application.followUp({ embeds: [nextClaimEmbed] });
		} else {
			let newStreak;

			if (player.dailyClaimedStreak === 5) {
				newStreak = 1;
			} else {
				const msDifference = currentDate.diff(lastClaimedDate, 'hours');

				if (msDifference <= 24) {
					newStreak = player.dailyClaimedStreak + 1;
				} else {
					newStreak = 1;
				}
			}

			let amount = 20000;
			amount *= 1 + (newStreak / 10);

			await player.updateOne({ $set: { dailyLastClaimedAt: Date.now(), dailyClaimedStreak: newStreak }, $inc: { mora: amount } });

			const streakArray = Array(newStreak).fill('<:primogem:942986065977933864>');

			for (let i = 0; i < (5 - newStreak); i++) {
				streakArray.push('<:primoempty:942986065357185035>');
			}

			const attachment = new MessageAttachment('.\\assets\\images\\paimon\\paimonTreasure.png', 'paimonTreasure.png');

			const dailyClaimedEmbed = new MessageEmbed()
				.setAuthor({ name: 'Daily Claimed!', iconURL: application.user.displayAvatarURL({ dynamic: true }) })
				.setThumbnail(`attachment://${attachment.name}`)
				.setDescription(`+${amount} Mora ${mora}`)
				.addField('Daily Streak', `${streakArray.join('')}`, true)
				.setColor('WHITE');
			return application.followUp({ embeds: [dailyClaimedEmbed], files: [attachment] });
		}
	}
};
