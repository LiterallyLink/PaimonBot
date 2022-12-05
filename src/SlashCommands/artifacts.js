const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('artifacts')
		.setDescription('Retrieve information on specific artifact sets.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the artifact set.')
				.setAutocomplete(true)),
	async run({ paimonClient, application }) {
		const artifactName = application.options.getString('name');

		const { artifacts } = paimonClient;
		const artifactSet = artifacts.get(artifactName);

		if (artifactSet) {
			const { name, rarity, bonuses, pieces } = artifactSet;

			const rarityRange = rarity.length === 1 ? `${rarity[0]}⭐` : `${rarity[0]}-${rarity.pop()}⭐`;

			const artifactSetEmbed = new MessageEmbed()
				.setTitle(`${name} Set`)
				.setThumbnail(`${pieces[0].image}`)
				.addField('Rarity', `${rarityRange}`, true)
				.setColor('WHITE');

			if (bonuses.length) {
				for (const bonus of bonuses) {
					artifactSetEmbed.addField(`${bonus.name}`, `${bonus.effect}`, true);
				}
			} else {
				artifactSetEmbed.addField('Bonuses', 'None', true);
			}

			const buttonRow = new MessageActionRow();

			for (const piece of pieces) {
				buttonRow.addComponents(
					new MessageButton()
						.setCustomId(piece.id)
						.setEmoji(paimonClient.utils.parseEmote(piece.id))
						.setStyle('PRIMARY')
				);
			}

			const artifactSetMessage = await application.followUp({ embeds: [artifactSetEmbed], components: [buttonRow] });

			const filter = i => i.user.id === application.user.id;
			const collector = artifactSetMessage.createMessageComponentCollector({ filter, time: 180000 });

			return collector.on('collect', async i => {
				i.deferUpdate();
				const choice = i.customId;

				buttonRow.components.filter(comp => comp.disabled ? comp.setDisabled(false) : null);
				buttonRow.components.find(comp => comp.customId === choice).setDisabled(true);

				const artifactPiece = pieces.find(piece => piece.id === choice);

				artifactSetEmbed.setTitle(artifactPiece.name);
				artifactSetEmbed.setThumbnail(artifactPiece.image);
				artifactSetEmbed.setDescription(artifactPiece.lore);

				artifactSetMessage.edit({ embeds: [artifactSetEmbed], components: [buttonRow] });
			});
		} else {
			const randomArtifact = [...artifacts.keys()][Math.floor(Math.random() * artifacts.size)];

			const artifactHelpEmbed = new MessageEmbed()
				.setTitle('Artifact Help')
				.setDescription(`To search for an artifact set.\nType \`/artifact <name>\`\nExample \`/artifact ${randomArtifact}\``)
				.setColor('WHITE');

			const rarities = [5, 4, 3, 2, 1];

			for (let i = 0; i < rarities.length; i++) {
				const filteredArtifacts = artifacts
					.filter(set => set.rarity.at(-1) === rarities[i])
					.sort((a, b) => a.name.localeCompare(b.name))
					.map(set => set.name);

				if (filteredArtifacts.length > 0) artifactHelpEmbed.addField('⭐'.repeat(rarities[i]), `${filteredArtifacts.join('\n')}`, true);
			}

			return application.followUp({ embeds: [artifactHelpEmbed] });
		}
	}
};
