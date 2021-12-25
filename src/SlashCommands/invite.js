const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { invite } = require('../../config.json');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Provides a link to invite Paimon to your server.'),
	async run({ application }) {
		const invButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Click Here!')
					.setURL(invite)
					.setStyle('LINK')
			);

		const inviteEmbed = new MessageEmbed()
			.setImage('https://i.ibb.co/h2cF80P/E4ww-Ozi-XEAIvoe4.png')
			.setColor('WHITE');
		return application.followUp({ embeds: [inviteEmbed], components: [invButton] });
	}
};
