const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const stringSimilarity = require('string-similarity');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('artifact')
		.setDescription('Retrieve information on artifact(s)/artifact sets.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the artifact set.')),
	async run({ paimonClient, application }) {
		const artifactName = application.options.getString('name');

		if (artifactName) {
			const artifactGuess = stringSimilarity.findBestMatch(artifactName, [...paimonClient.artifacts.keys()]).bestMatch.target;
			const artifact = paimonClient.artifacts.get(artifactGuess);

			const { name, description, maxRarity, id } = artifact;
			const starRarity = Array(maxRarity).fill('⭐').join('');

			const artifactImage = new MessageAttachment(`.\\assets\\images\\artifacts\\${id}.png`, `${id}.png`);

			const artifactEmbed = new MessageEmbed()
				.setTitle(`${name} Set`)
				.setDescription(description)
				.setThumbnail(`attachment://${id}.png`)
				.addField('Max Rarity', `${starRarity}`, true)
				.setColor('WHITE');

			if (artifact.pieceBonuses) {
				for (let i = 0; i < artifact.pieceBonuses.length; i++) {
					artifactEmbed.addField(`${artifact.pieceBonuses[i].type}`, `${artifact.pieceBonuses[i].effect}`, true);
				}
			}

			return application.followUp({ embeds: [artifactEmbed], files: [artifactImage] });
		} else {
			const artifactThumbnail = new MessageAttachment(`.\\assets\\images\\artifacts\\strongbox.png`, `strongbox.png`);
			const artifactRarities = [5, 4, 3, 1];

			const artifactEmbed = new MessageEmbed()
				.setTitle('Artifact Set List')
				.setThumbnail(`attachment://strongbox.png`)
				.setDescription(`For information on an artifact set.\nType \`/artifact <name>\`\n\n`)
				.setColor('WHITE');

			for (let i = 0; i < artifactRarities.length; i++) {
				const filteredArtifactList = paimonClient.artifacts.map(art => art).filter(art => art.maxRarity === artifactRarities[i]);
				artifactEmbed.addField(`${artifactRarities[i]} ⭐`, `${filteredArtifactList.map(art => art.name).join('\n')}`, true);
			}

			return application.followUp({ embeds: [artifactEmbed], files: [artifactThumbnail] });
		}
	}
};
