/* eslint-disable consistent-return */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const emote = require('../../assets/emotes.json');
const charImages = require('../../assets/charImages.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('character')
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
				])),
	async run({ paimonClient, application }) {
		const characterName = application.options.getString('name');
		const weaponType = application.options.getString('weapon');
		const visionType = application.options.getString('vision');
		let characterList = paimonClient.characters;

		if (characterName) {
			let character = this.findCharacterByName(characterList, characterName);

			if (!character) {
				const characterGuess = this.autoCorrect(characterList, characterName);
				character = this.findCharacterByName(characterList, characterGuess.name);

				if (characterGuess.editDistance > 2) {
					const characterInputted = characterName.length > 15 ? `${characterName.substring(0, 15)}...` : characterName;

					const confirmOrDeny = new MessageActionRow()
						.addComponents(
							new MessageButton()
								.setCustomId('confirm')
								.setStyle('SUCCESS')
								.setLabel('Confirm'),
							new MessageButton()
								.setCustomId('deny')
								.setLabel('Cancel')
								.setStyle('DANGER')
						);

					const didYouMeanEmbed = new MessageEmbed()
						.setTitle('Character Not Found')
						.setThumbnail(character.icon)
						.setDescription(`You searched for \`${characterInputted}\`\nDid you mean \`${character.name}\`?`)
						.setColor('WHITE');
					const msg = await application.followUp({ embeds: [didYouMeanEmbed], components: [confirmOrDeny] });

					const filter = i => {
						i.deferUpdate();
						return i.user.id === application.user.id;
					};

					const optionCollector = await msg.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 150000 }).catch(() => null);
					msg.delete().catch(() => null);
					if (!optionCollector || optionCollector.customId === 'deny') return;
				}
			}

			const { name, rarity, weapon, element, description, region, faction, image, icon, roles, constellation } = character;
			const charRarity = Array(rarity).fill('⭐').join('');
			const optionRow = new MessageActionRow();

			if (charImages[name.toLowerCase()]?.ascension) {
				optionRow.addComponents(
					new MessageButton()
						.setCustomId('ascension')
						.setLabel('Ascension')
						.setStyle('PRIMARY')
				);
			}

			for (let i = 0; i < character.roles.length; i++) {
				optionRow.addComponents(
					new MessageButton()
						.setCustomId(roles[i].name)
						.setLabel(roles[i].name)
						.setStyle('PRIMARY')
				);
			}

			if (character.constellations.length) {
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

			const characterInformationEmbed = new MessageEmbed()
				.setTitle(`${name}`)
				.setImage(image)
				.setThumbnail(icon)
				.setDescription(`${description || 'No description available.'}`)
				.addField('Vision', `${paimonClient.utils.capitalize(element) || 'Unknown'} ${emote?.[element.toLowerCase()] || ''}`, true)
				.addField('Weapon', `${paimonClient.utils.capitalize(weapon) || 'Unknown'} ${emote?.[weapon.toLowerCase()] || ''}`, true)
				.addField('Nation', `${paimonClient.utils.capitalize(region) || 'Unknown'} ${emote?.[region.toLowerCase()] || ''}`, true)
				.addField('Affiliation', `${paimonClient.utils.capitalize(faction) || 'Unknown'}`, true)
				.addField('Rarity', `${charRarity || 'Unknown'}`, true)
				.addField('Constellation', `${paimonClient.utils.capitalize(constellation) || 'Unknown'}`, true)
				.setColor('WHITE');
			const characterEmbed = await application.followUp({ embeds: [characterInformationEmbed], components: [optionRow] });

			const filter = i => i.user.id === application.user.id;

			const collector = characterEmbed.createMessageComponentCollector({ filter, time: 300000 });

			return collector.on('collect', async i => {
				i.deferUpdate();
				const choice = i.customId;

				if (choice === 'delete') {
					collector.stop();
					characterEmbed.delete().catch(() => null);
				}

				if (choice === 'constellation') {
					const { constellations } = character;
					const constellationEmbed = new MessageEmbed()
						.setAuthor(`${name}`, icon)
						.setThumbnail(image)
						.setDescription(`**Constellation**\n\n${constellation}`)
						.setColor('WHITE');

					for (let j = 0; j < constellations.length; j++) {
						constellationEmbed.addField(`${constellations[j].name}`, `Level: **${constellations[j].order}**\n${constellations[j].description}`, true);
					}

					await characterEmbed.edit({ embeds: [constellationEmbed] });
				}

				if (choice === 'ascension') {
					const charBuildEmbed = new MessageEmbed()
						.setAuthor(`${name}`, icon)
						.setImage(charImages?.[name.toLowerCase()].ascension)
						.setColor('WHITE');
					await characterEmbed.edit({ embeds: [charBuildEmbed] });
				}

				const charBuild = roles.find(build => build.name === choice);

				if (charBuild) {
					const { weapons, artifacts } = charBuild;
					const weaponList = weapons.length ? paimonClient.utils.capitalize(weapons.slice(0, 5).map(weap => weap.weaponId).join('\n').replace(/-/g, ' ')) : 'No Weapon Recommendations';
					const artifactList = artifacts.length ? paimonClient.utils.capitalize(artifacts.slice(0, 5).map(art => art.artifactSetId).join('\n').replace(/-/g, ' ')) : 'No Artifact Recommendations';

					const charBuildEmbed = new MessageEmbed()
						.setTitle(`${charBuild.name}`)
						.setAuthor(`${name}`, icon)
						.addField(`${emote?.[weapon.toLowerCase()]} Weapons`, `${weaponList}`, true)
						.addField('Artifacts', `${artifactList}`, true)
						.setColor('WHITE');
					await characterEmbed.edit({ embeds: [charBuildEmbed] });
				}
			});
		} else if (weaponType || visionType) {
			if (weaponType) characterList = characterList.filter(char => char.weapon === weaponType);
			if (visionType) characterList = characterList.filter(char => char.element === visionType);

			const characterNames = characterList.map(char => char.name);
			const updatedCharacterList = characterNames.length ? characterNames.join('\n') : 'None';

			const filteredCharacterListEmbed = new MessageEmbed()
				.setTitle(`List Of ${visionType || ''} ${weaponType || ''} Characters`)
				.setDescription(`${updatedCharacterList}`)
				.setColor('WHITE');
			return application.followUp({ embeds: [filteredCharacterListEmbed] });
		}

		const charListEmbed = new MessageEmbed()
			.setTitle('Character Help')
			.setDescription('To search for a character.\nType `/character <name>`\nTo filter out certain characters.\nType `/character <weapon type> or <vision>`')
			.setColor('WHITE');

		const elementList = [...paimonClient.elements.keys()];

		for (let i = 0; i < elementList.length; i++) {
			const elementName = elementList[i];
			const filteredCharacters = characterList.filter(char => char.element === elementName).map(char => char.name);
			charListEmbed.addField(`${emote[elementName.toLowerCase()]} ${elementName}`, filteredCharacters.join('\n'), true);
		}
		return application.followUp({ embeds: [charListEmbed] });
	},

	findCharacterByName(characterList, characterName) {
		return characterList.find(char => char.id === characterName.toLowerCase());
	},

	autoCorrect(characterList, character) {
		/* eslint-disable id-length */
		const characters = characterList.map(char => char.id);
		const characterObj = characters.map(char => ({ name: char, editDistance: 0 }));

		for (let i = 0; i < characters.length; i++) {
			if (characters[i].length === 0) return character.length;
			if (character.length === 0) return characters[i].length;

			const matrix = [];

			for (let j = 0; j <= character.length; j++) {
				matrix[j] = [j];
			}

			for (let h = 0; h <= characters[i].length; h++) {
				matrix[0][h] = h;
			}

			for (let k = 1; k <= character.length; k++) {
				for (let j = 1; j <= characters.length; j++) {
					if (character.charAt(k - 1) === characters[i].charAt(j - 1)) {
						matrix[k][j] = matrix[k - 1][j - 1];
					} else {
						matrix[k][j] = Math.min(matrix[k - 1][j - 1] + 1,
							Math.min(matrix[k][j - 1] + 1,
								matrix[k - 1][j] + 1));
					}
				}
			}

			characterObj[i].editDistance = matrix[character.length][characters[i].length];
		}

		return characterObj.reduce((a, b) => a.editDistance < b.editDistance ? a : b);
	}
};
