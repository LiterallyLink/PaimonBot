const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow, MessageAttachment } = require('discord.js');
const emote = require('../../assets/emotes.json');
const stringSimilarity = require('string-similarity');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('characters')
		.setDescription('Retrieve information on a character.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the character.'))
		.addStringOption(option =>
			option
				.setName('weapon')
				.setDescription('The character\'s weapon type.')
				.addChoices([
					['Sword', 'Sword'],
					['Polearm', 'Polearm'],
					['Bow', 'Bow'],
					['Catalyst', 'Catalyst'],
					['Claymore', 'Claymore']
				]))
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
				]))
		.addStringOption(option =>
			option
				.setName('rarity')
				.setDescription('The rarity of the characters.')
				.addChoices([
					['⭐⭐⭐⭐', '4'],
					['⭐⭐⭐⭐⭐', '5']
				])),
	async run({ paimonClient, application }) {
		const characterName = application.options.getString('name');
		const weaponType = application.options.getString('weapon');
		const visionType = application.options.getString('vision');
		const characterRarity = application.options.getString('rarity');
		let characterList = paimonClient.characters;

		if (characterName) {
			const characterGuess = stringSimilarity.findBestMatch(characterName.toLowerCase(), characterList.map(char => char.name)).bestMatch.target;
			const character = characterList.get(characterGuess);
			const { id, name, rarity, weapon, element, description, region, faction, image, icon, roles, constellation } = character;

			const starRarity = Array(rarity).fill('⭐').join('');

			const optionRow = new MessageActionRow();

			if (character.constellations?.length) {
				optionRow.addComponents(
					new MessageButton()
						.setCustomId('constellation')
						.setLabel('Constellations')
						.setStyle('PRIMARY')
				);
			}

			optionRow.addComponents(
				new MessageButton()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle('PRIMARY')
			);

			const characterEmbed = new MessageEmbed()
				.setTitle(name)
				.setImage(image)
				.setDescription(`${description}`)
				.addField('Vision', ` ${emote[element.toLowerCase()] || ''} ${paimonClient.utils.capitalize(element)}` || 'Unknown', true)
				.addField('Weapon', ` ${emote[weapon.toLowerCase()] || ''} ${paimonClient.utils.capitalize(weapon)}` || 'Unknown', true)
				.addField('Nation', ` ${emote[region.toLowerCase()] || ''} ${paimonClient.utils.capitalize(region) || 'Unknown'}`, true)
				.addField('Affiliation', `${paimonClient.utils.capitalize(faction) || 'Unknown'}`, true)
				.addField('Rarity', `${starRarity || 'Unknown'}`, true)
				.addField('Constellation', `${constellation || 'Unknown'}`, true)
				.setColor('WHITE');
			const charEmbedMsg = await application.followUp({ embeds: [characterEmbed], components: [optionRow] });

			const filter = i => i.user.id === application.user.id;
			const collector = charEmbedMsg.createMessageComponentCollector({ filter, time: 300000 });

			return collector.on('collect', async i => {
				i.deferUpdate();
				const choice = i.customId;

				if (choice === 'delete') {
					collector.stop();
					charEmbedMsg.delete().catch(() => null);
				}

				if (choice === 'constellation') {
					const { constellations } = character;

					const constellationEmbed = new MessageEmbed()
						.setAuthor({ name: `${name}`, iconURL: icon })
						.setDescription(`**Constellation**\n\n${constellation}`)
						.setColor('WHITE');

					if (id !== 'aloy') {
						const constellationThumbnail = new MessageAttachment(`.\\assets\\images\\characters\\constellations\\${id}-constellation.jpg`, `${id}-constellation.jpg`);
						constellationEmbed.setImage(`attachment://${constellationThumbnail.name}`);
						charEmbedMsg.files = [constellationThumbnail];
					}

					for (let j = 0; j < constellations.length; j++) {
						constellationEmbed.addField(`${constellations[j].name}`, `Level: **${constellations[j].order}**\n${constellations[j].description}`, true);
					}

					await charEmbedMsg.edit({ embeds: [constellationEmbed] });
				}

				const charBuild = roles.find(build => build.name === choice);

				if (charBuild) {
					const { weapons, artifacts } = charBuild;
					const weaponList = weapons.length ? paimonClient.utils.capitalize(weapons.slice(0, 5).map(weap => weap.weaponId).join('\n').replace(/-/g, ' ')) : 'No Weapon Recommendations';
					const artifactList = artifacts.length ? paimonClient.utils.capitalize(artifacts.slice(0, 5).map(art => art.artifactSetId).join('\n').replace(/-/g, ' ')) : 'No Artifact Recommendations';

					const charBuildEmbed = new MessageEmbed()
						.setTitle(`${charBuild.name}`)
						.setAuthor({ name: `${name}`, iconURL: icon })
						.addField(`${emote?.[weapon.toLowerCase()]} Weapons`, `${weaponList}`, true)
						.addField(`${emote.artifact} Artifacts`, `${artifactList}`, true)
						.setColor('WHITE');
					await charEmbedMsg.edit({ embeds: [charBuildEmbed] });
				}
			});
		} else if (weaponType || visionType || characterRarity) {
			let embedTitle = '';

			if (characterRarity) {
				embedTitle += `${characterRarity} Star`;
				characterList = characterList.filter(char => `${char.rarity}` === characterRarity);
			}

			if (visionType) {
				embedTitle += ` ${visionType}`;
				characterList = characterList.filter(char => char.element === visionType);
			}

			if (weaponType) {
				embedTitle += ` ${weaponType}`;
				characterList = characterList.filter(char => char.weapon === weaponType);
			}

			const filteredCharacterListEmbed = new MessageEmbed()
				.setTitle(`${embedTitle} Characters`)
				.setThumbnail('https://i.ibb.co/nbp23by/paimon.png')
				.setDescription(`${characterList.map(char => char.name).join('\n') || 'No Characters Found'}`)
				.setColor('WHITE');
			return application.followUp({ embeds: [filteredCharacterListEmbed] });
		} else {
			const charListEmbed = new MessageEmbed()
				.setTitle('Character Help')
				.setDescription('To search for a character.\nType `/character <name>`\nTo filter for certain characters.\nType `/character <weapon type> or <vision>`')
				.setColor('WHITE');

			const characterTypes = ['Geo', 'Hydro', 'Pyro', 'Electro', 'Cryo', 'Anemo'];

			for (let i = 0; i < characterTypes.length; i++) {
				const elementName = characterTypes[i];
				const filteredCharacters = characterList.filter(char => char.element === elementName).map(char => char.name);
				charListEmbed.addField(`${emote[elementName.toLowerCase()]} ${elementName}`, filteredCharacters.join('\n'), true);
			}

			return application.followUp({ embeds: [charListEmbed] });
		}
	}
};
