const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const { anemo, cryo, dendro, electro, geo, hydro, pyro } = require('../../assets/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('element')
		.setDescription('Retrieve information on specific elements/reactions.'),
	async run({ paimonClient, application }) {
		const elementRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Anemo')
					.setEmoji(anemo)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('Cryo')
					.setEmoji(cryo)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('Dendro')
					.setEmoji(dendro)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('Electro')
					.setEmoji(electro)
					.setStyle('PRIMARY')
			);

		const elementRow2 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Geo')
					.setEmoji(geo)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('Hydro')
					.setEmoji(hydro)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('Pyro')
					.setEmoji(pyro)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle('PRIMARY')
			);

		const thumbnail = new MessageAttachment('.\\assets\\images\\other\\elementalsight.png', 'elementalsight.png');

		const elementEmbed = new MessageEmbed()
			.setTitle('Element Help Menu')
			.setDescription('Click on an element below\nfor more information on it.')
			.setThumbnail('attachment://elementalsight.png')
			.setColor('WHITE');
		const msg = await application.followUp({ embeds: [elementEmbed], components: [elementRow, elementRow2], files: [thumbnail] });

		const filter = i => {
			i.deferUpdate();
			return i.user.id === application.user.id;
		};

		const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

		return collector.on('collect', async i => {
			const { customId } = i;

			if (customId === 'delete') {
				collector.stop();
				return msg.delete().catch(() => null);
			}

			const { name, description, reactions, resonance } = paimonClient.elements.get(customId);
			const elementThumbnail = new MessageAttachment(`.\\assets\\images\\elements\\${customId}.png`, `${customId}.png`);
			const playableCharacters = paimonClient.characters.filter(char => char.element === customId).map(char => char.name).join('\n');

			const elementInfoEmbed = new MessageEmbed()
				.setTitle(name)
				.setThumbnail(`attachment://${elementThumbnail.name}`)
				.setDescription(description)
				.addField(`Playable ${name} Characters`, playableCharacters, true)
				.addField('Reactions', reactions.join('\n'), true)
				.addField('Resonance', resonance, true)
				.setColor('WHITE');
			return msg.edit({ embeds: [elementInfoEmbed], components: [elementRow, elementRow2], files: [elementThumbnail] });
		});
	}
};
