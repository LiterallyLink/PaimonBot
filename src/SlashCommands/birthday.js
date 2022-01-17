const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Retrieve information on a character(s) birthday'),
	async run({ paimonClient, application }) {
		const listOfMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		const sortedBirthdaylist = [...paimonClient.characters.values()].sort((a, b) => a.birthdayDay - b.birthdayDay);
		const attachment = new MessageAttachment('.\\assets\\images\\other\\birthdaycake.png', 'birthdaycake.png');

		const listOfBirthdaysEmbed = new MessageEmbed()
			.setTitle('List of Birthdays')
			.setThumbnail(`attachment://${attachment.name}`)
			.setColor('WHITE');

		for (let i = 0; i < listOfMonths.length; i++) {
			listOfBirthdaysEmbed.addField(`${listOfMonths[i]}`, `${sortedBirthdaylist
				.filter(char => char.birthdayMonth === listOfMonths[i])
				.map(char => `${char.birthdayDay}. ${char.name}`)
				.join('\n')}`, true);
		}

		return application.followUp({ embeds: [listOfBirthdaysEmbed], files: [attachment] });
	}
};
