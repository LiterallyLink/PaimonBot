/* eslint-disable consistent-return */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const emote = require('../../assets/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('element')
		.setDescription('Retrieve information on specific elements.')
		.addStringOption(option =>
			option
				.setName('vision')
				.setDescription('The character\'s vision.')
				.addChoices([
					['Pyro', 'Pyro'],
					['Dendro', 'Dendro'],
					['Hydro', 'Hydro'],
					['Cryo', 'Cryo'],
					['Geo', 'Geo'],
					['Electro', 'Electro'],
					['Anemo', 'Anemo']
				])),
	async run({ paimonClient, application }) {
		const visionType = application.options.getString('vision');
		const elementList = paimonClient.elements;
		const reactions = this.formatReactions(elementList);
		console.log(reactions);
	},

	formatReactions(elementList) {
		const formattedList = elementList.map(ele => {
			for (let i = 0; i < ele.reactions.length; i++) {
				ele.reactions[i].element.push(ele.name);
			}

			return ele;
		});

        console.log(formattedList);
	}
};
