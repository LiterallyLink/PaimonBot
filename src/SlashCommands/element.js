const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const emote = require('../../assets/emotes.json');
const elementalData = require('../../assets/elementalData.json');
const { reactionData } = elementalData;

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
					['Hydro', 'Hydro'],
					['Cryo', 'Cryo'],
					['Geo', 'Geo'],
					['Electro', 'Electro'],
					['Anemo', 'Anemo']
				])),
	async run({ application }) {
		const vision = application.options.getString('vision');

		if (vision) {
			const optionRow = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('characters')
						.setLabel(`${vision} Characters`)
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId('reactions')
						.setLabel('Reactions')
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId('delete')
						.setLabel('🗑️')
						.setStyle('PRIMARY')
				);

			const element = elementalData[vision.toLowerCase()];

			const visionTypeEmbed = new MessageEmbed()
				.setTitle(`${vision} Vision Information`)
				.setThumbnail(element.image)
				.setDescription(element.description)
				.setColor('WHITE');
			const visionMsg = await application.followUp({ embeds: [visionTypeEmbed], components: [optionRow] });

			const filter = i => i.user.id === application.user.id;
			const collector = visionMsg.createMessageComponentCollector({ filter, time: 300000 });

			return collector.on('collect', async i => {
				i.deferUpdate();
				const choice = i.customId;

				if (choice === 'delete') {
					collector.stop();
					visionMsg.delete().catch(() => null);
				}

				if (choice === 'characters') {
					const characterVisionEmbed = new MessageEmbed()
						.setTitle(`${vision} Vision Characters`)
						.setColor('WHITE');
					await visionMsg.edit({ embeds: [characterVisionEmbed] });
				}

				if (choice === 'reactions') {
					const reactionsEmbed = new MessageEmbed()
						.setTitle(`${vision} Vision Reactions`)
						.setColor('WHITE');

					for (let j = 0; j < element.reactions.length; j++) {
						const { elementalFormula, initialElement, name, description } = reactionData.find(react => react.name === element.reactions[j]);
						let reactionElementArray;

						if (vision === 'Geo' || vision === 'Anemo' || !initialElement) {
							reactionElementArray = elementalFormula;
						} else {
							reactionElementArray = [initialElement, vision.toLowerCase()];
						}

						reactionsEmbed.addField(`${name}\n${this.formatEmojis(reactionElementArray)}`, `${description}`, true);
					}

					await visionMsg.edit({ embeds: [reactionsEmbed] });
				}
			});
		}

		const elementalReactionEmbed = new MessageEmbed()
			.setTitle('Elemental Reactions')
			.setThumbnail('https://i.ibb.co/HD4gKwc/Icon-Elemental-Sight.png')
			.setColor('WHITE');

		for (let i = 0; i < reactionData.length; i++) {
			const { name, description, elementalFormula } = reactionData[i];
			elementalReactionEmbed.addField(`${name}\n${this.formatEmojis(elementalFormula)}`, `${description}`, true);
		}
		return application.followUp({ embeds: [elementalReactionEmbed] });
	},

	formatEmojis(elementsArray) {
		let formattedEmojis = '';

		for (let i = 0; i < elementsArray.length; i++) {
			formattedEmojis += `${emote[elementsArray[i]]}`;
		}

		return formattedEmojis;
	}
};
