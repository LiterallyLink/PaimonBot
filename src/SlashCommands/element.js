const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
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
					['Hydro', 'Hydro'],
					['Cryo', 'Cryo'],
					['Geo', 'Geo'],
					['Electro', 'Electro'],
					['Anemo', 'Anemo']
				])),
	async run({ paimonClient, application }) {
		const vision = application.options.getString('vision');

		if (vision) {
			const { description, reactions } = paimonClient.elements.get(vision);
			const attachment = new MessageAttachment(`.\\assets\\images\\elements\\${vision}.png`, `${vision}.png`);

			const optionRow = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('back')
						.setLabel('Back')
						.setStyle('PRIMARY')
						.setDisabled(true)
				)
				.addComponents(
					new MessageButton()
						.setCustomId('reactions')
						.setLabel('Reactions')
						.setStyle('PRIMARY')
				)
				.addComponents(
					new MessageButton()
						.setCustomId('delete')
						.setLabel('🗑️')
						.setStyle('PRIMARY')
				);

			const elementEmbed = new MessageEmbed()
				.setTitle(`${vision} Element Information`)
				.setThumbnail(`attachment://${attachment.name}`)
				.setDescription(description)
				.setColor('WHITE');
			const msg = await application.followUp({ embeds: [elementEmbed], files: [attachment], components: [optionRow] });

			const filter = i => i.user.id === application.user.id;
			const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

			return collector.on('collect', async i => {
				i.deferUpdate();
				const { customId } = i;

				if (customId === 'delete') {
					collector.stop();
					msg.delete().catch(() => null);
				}

				if (customId === 'reactions') {
					optionRow.components[0].setDisabled(false);
					optionRow.components[1].setDisabled(true);

					const filteredReactions = paimonClient.reactions.filter(reaction => reactions.includes(reaction.name));

					const reactionEmbed = new MessageEmbed()
						.setTitle(`${vision} Element Reactions`)
						.setThumbnail(`attachment://${attachment.name}`)
						.setColor('WHITE');

					for (const [key, value] of filteredReactions) {
						reactionEmbed.addField(`${key}`, `${this.formatEmojis(value.elementalFormula)}\n${value.description}`, true);
					}

					msg.edit({ embeds: [reactionEmbed], files: [attachment], components: [optionRow] });
				}

				if (customId === 'back') {
					optionRow.components[0].setDisabled(true);
					optionRow.components[1].setDisabled(false);

					msg.edit({ embeds: [elementEmbed], files: [attachment], components: [optionRow] });
				}
			});
		} else {
			const elementalReactionEmbed = new MessageEmbed()
				.setTitle('Elemental Reactions')
				.setColor('WHITE');

			for (const [key, value] of paimonClient.reactions) {
				elementalReactionEmbed.addField(`${key}`, `${this.formatEmojis(value.elementalFormula)}\n${value.description}`, true);
			}

			return application.followUp({ embeds: [elementalReactionEmbed] });
		}
	},

	formatEmojis(elementalFormula) {
		let emojiString = '';

		for (let i = 0; i < elementalFormula.length; i++) {
			const element = elementalFormula[i];
			const emoji = emote[element];

			emojiString += `${emoji} `;
		}

		return emojiString;
	}
};
