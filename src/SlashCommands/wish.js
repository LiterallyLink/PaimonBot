/* eslint-disable no-console */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wish')
		.setDescription('Genshin Impact Wishing Simulator')
		.addStringOption(option =>
			option
				.setName('banner')
				.setDescription('The desired banner to wish on.')
				.setRequired(true)
				.addChoices(
					{ name: 'The Heron Court', value: 'heron' },
					{ name: 'Epitome Invocation', value: 'epitome' },
					{ name: 'Wanderlust Invocation', value: 'wanderlust' }
				)),
	async run({ paimonClient, application }) {
		console.time('start');
		const banner = application.options.getString('banner');
		const { name, image, emote, gachaPool } = require(`../../assets/wishing/data/${banner}.json`);

		const wishButtons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel(`1x`)
					.setEmoji(emote)
					.setCustomId('intertwined')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setLabel('10x')
					.setEmoji(emote)
					.setCustomId('acquaint')
					.setStyle('PRIMARY')
			);


		const thumbnail = new MessageAttachment(`assets/wishing/images/thumbnails/${image}.png`, `${image}.png`);

		const bannerEmbed = new MessageEmbed()
			.setImage(`attachment://${thumbnail.name}`)
			.setColor('WHITE');
		application.followUp({ embeds: [bannerEmbed], files: [thumbnail], components: [wishButtons] });

		console.timeEnd('start');
	}
};
