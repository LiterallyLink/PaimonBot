const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthdays')
		.setDescription('Retrieve information on a character(s) birthday')
		.addStringOption(option =>
			option
				.setName('month')
				.setDescription('The month of the character(s) birthday.')
				.setChoices(
					{ name: 'January', value: 'January' },
					{ name: 'February', value: 'February' },
					{ name: 'March', value: 'March' },
					{ name: 'April', value: 'April' },
					{ name: 'May', value: 'May' },
					{ name: 'June', value: 'June' },
					{ name: 'July', value: 'July' },
					{ name: 'August', value: 'August' },
					{ name: 'September', value: 'September' },
					{ name: 'October', value: 'October' },
					{ name: 'November', value: 'November' },
					{ name: 'December', value: 'December' }
				)),
	async run({ paimonClient, application }) {
		const listOfMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		const months = application.options.getString('month') || listOfMonths;
		const attachment = new MessageAttachment('.\\assets\\images\\other\\birthdaycake.png', 'birthdaycake.png');

		const listOfBirthdaysEmbed = new MessageEmbed()
			.setTitle('List of Birthdays')
			.setThumbnail(`attachment://${attachment.name}`)
			.setColor('WHITE');

		let charactersInMonth;
		const { characters } = paimonClient;

		if (Array.isArray(months)) {
			for (const month of months) {
				charactersInMonth = characters.filter(character => character.birthMonth.includes(month));
				listOfBirthdaysEmbed.addField(`${month}`, charactersInMonth.map(character => `${character.birthDay}. ${character.name}`).join('\n'), true);
			}
		} else {
			charactersInMonth = characters.filter(character => character.birthMonth === months);
			const characterNames = charactersInMonth.map(character => `${character.birthDay}. ${character.name}`).join('\n');

			listOfBirthdaysEmbed.setTitle(`Birthdays in ${months}`);
			listOfBirthdaysEmbed.addField('_ _', characterNames);
		}

		return application.followUp({ embeds: [listOfBirthdaysEmbed], files: [attachment] });
	}
};
