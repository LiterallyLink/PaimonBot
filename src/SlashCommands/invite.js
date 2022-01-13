const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
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

		const attachment = new MessageAttachment('.\\assets\\images\\paimon\\paimonInvite.png', 'paimonInvite.png');

		const inviteEmbed = new MessageEmbed()
			.setImage(`attachment://${attachment.name}`)
			.setColor('WHITE');
		return application.followUp({ embeds: [inviteEmbed], components: [invButton], files: [attachment] });
	}
};
