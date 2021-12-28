const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const emote = require('../../assets/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('element')
		.setDescription('Retrieve information on specific elements/reactions.')
		.addStringOption(option =>
			option
				.setName('vision')
				.setDescription('The desired vision.')
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
		const elementList = paimonClient.elements.map(ele => ele);

		let reactionsArray = [];

		for (let i = 0; i < elementList.length; i++) {
			for (let j = 0; j < elementList[i].reactions.length; j++) {
				const reactionObj = {
					name: elementList[i].reactions[j].name,
					reactionFormula: elementList[i].reactions[j].elements,
					initialElement: elementList[i].name,
					description: elementList[i].reactions[j].description
				};

				reactionsArray.push(reactionObj);
			}
		}

		reactionsArray = reactionsArray.filter((value, index, self) =>
			index === self.findIndex((item) =>
				item.place === value.place && item.name === value.name
			));

		const elementalReactionEmbed = new MessageEmbed()
			.setTitle('Elemental Reactions')
			.setThumbnail('https://i.ibb.co/HD4gKwc/Icon-Elemental-Sight.png')
			.setColor('WHITE');

		for (let i = 0; i < reactionsArray.length; i++) {
			const { name, initialElement, description, reactionFormula } = reactionsArray[i];
			elementalReactionEmbed.addField(`${name}\n${this.convertReactionsToEmojis(reactionFormula, initialElement)}`, `${description}`, true);
		}

		return application.followUp({ embeds: [elementalReactionEmbed] });
	},

	convertReactionsToEmojis(reactionFormulaArray, initialElement) {
		const initialElementEmoji = emote[initialElement.toLowerCase()];
		const reactionFormulaEmoji = reactionFormulaArray.map(ele => emote[ele.toLowerCase()]);
		reactionFormulaEmoji.push(initialElementEmoji);
		return reactionFormulaEmoji.join(' ');
	}
};
