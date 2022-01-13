const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const stringSimilarity = require('string-similarity');
const artifactSetList = require('../../assets/data/artifacts/artifacts.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('artifact')
		.setDescription('Retrieve information on artifact(s)/artifact sets.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the artifact set.')),
	async run({ application }) {
		const artifactName = application.options.getString('name');

		if (artifactName) {
			const artifactGuess = stringSimilarity.findBestMatch(artifactName, artifactSetList.map(artifact => artifact.name)).bestMatch.target;
			const artifact = artifactSetList.find(art => art.name === artifactGuess);

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
			const artifactSetNames = artifactSetList.map(artifact => artifact.name).join('\n');
			const artifactThumbnail = new MessageAttachment(`.\\assets\\images\\artifacts\\strongbox.png`, `strongbox.png`);

			const artifactEmbed = new MessageEmbed()
				.setTitle('Artifact Set List')
				.setThumbnail(`attachment://strongbox.png`)
				.setDescription(`For information on an artifact set.\nType \`/artifact <name>\`\n\n${artifactSetNames}`)
				.setColor('WHITE');
			return application.followUp({ embeds: [artifactEmbed], files: [artifactThumbnail] });
		}
	}
};
