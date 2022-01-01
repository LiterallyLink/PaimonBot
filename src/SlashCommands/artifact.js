const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const emote = require('../../assets/emotes.json');
const stringSimilarity = require('string-similarity');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('artifact')
		.setDescription('Retrieve information on artifact(s)/artifact sets.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the artifact set.'))
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('The artifact\'s type.')
				.addChoices([
					['Flower of Life', 'Flower of Life'],
					['Plume of Death', 'Plume of Death'],
					['Sands of Eon', 'Sands of Eon'],
					['Goblet of Eonothem', 'Goblet of Eonothem'],
					['Circlet of Logos', 'Circlet of Logos']
				]))
		.addStringOption(option =>
			option
				.setName('rarity')
				.setDescription('The rarity of the characters.')
				.addChoices([
					['⭐', '1'],
					['⭐⭐', '2'],
					['⭐⭐⭐', '3'],
					['⭐⭐⭐⭐', '4'],
					['⭐⭐⭐⭐⭐', '5']
				])),
	async run({ paimonClient, application }) {
		let artifactName = application.options.getString('name');
		const artifactRarity = application.options.getString('rarity');
		const artifactType = application.options.getString('type');
		const artifactList = paimonClient.artifacts;
		if (artifactName) {
			artifactName = artifactName.toLowerCase();
			const artifactGuess = stringSimilarity.findBestMatch(artifactName, Array.from(artifactList.keys())).bestMatch.target;
			const artifact = artifactList.get(artifactGuess)[0];
			const starRarity = Array(artifact.artifactSet.maxRarity).fill('⭐').join('');

			const artifactEmbed = new MessageEmbed()
				.setTitle(artifact.name)
				.setThumbnail(artifact.image)
				.setDescription(`Obtainable from ${artifact.location}\n\n${artifact.description}` || 'No description available.')
				.addField('2 Piece Bonus', `${artifact.artifactSet.twoPieceBonus}`, true)
				.addField('4 Piece Bonus', `${artifact.artifactSet.fourPieceBonus}`, true)
				.addField('Max Rarity', `${starRarity}`, true)
				.setColor('WHITE');
			return application.followUp({ embeds: [artifactEmbed] });
		} else if (artifactRarity || artifactType) {
			let weaponTitle = '';
			let mappedArtifactList = artifactList.map(art => art).flat();

			if (artifactRarity) {
				weaponTitle += `${artifactRarity} Star`;
				mappedArtifactList = mappedArtifactList.filter(art => `${art.rarity}` === artifactRarity);
			}

			if (artifactType) {
				weaponTitle += ` ${artifactType}`;
				mappedArtifactList = mappedArtifactList.filter(art => art.type === artifactType);
			}

			const filteredArtifactsEmbed = new MessageEmbed()
				.setTitle(`${weaponTitle} Artifacts`)
				.setThumbnail(mappedArtifactList[0].image)
				.setDescription(`${mappedArtifactList.map(art => `${art.rarity}⭐ ${emote[art.type.split(' ')[0].toLowerCase()]} ${art.name}`).join('\n')}`)
				.setColor('WHITE');
			return application.followUp({ embeds: [filteredArtifactsEmbed] });
		}

		const artifactEmbed = new MessageEmbed()
			.setTitle('Artifact Help')
			.setDescription('To search for an artifact set.\nType `/artifact <name>`\nTo filter for certain artifacts.\nType `/artifact <type> or <rarity>`')
			.setColor('WHITE');

		const artifactTypeList = [...new Set(artifactList.map(art => art).flat().map(art => art.type))];

		for (let i = 0; i < artifactTypeList.length; i++) {
			artifactEmbed.addField(`${emote[artifactTypeList[i].split(' ')[0].toLowerCase()]} ${artifactTypeList[i]}`, `ass`, true);
		}

		return application.followUp({ embeds: [artifactEmbed] });
	}
};
