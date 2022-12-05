const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('characters')
		.setDescription('Retrieve information on the specified character(s).')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the character.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option
				.setName('vision')
				.setDescription('The vision of the character(s).')
				.setChoices(
					{ name: 'Anemo', value: 'Anemo' },
					{ name: 'Cryo', value: 'Cryo' },
					{ name: 'Dendro', value: 'Dendro' },
					{ name: 'Electro', value: 'Electro' },
					{ name: 'Geo', value: 'Geo' },
					{ name: 'Hydro', value: 'Hydro' },
					{ name: 'Pyro', value: 'Pyro' }
				))
		.addStringOption(option =>
			option
				.setName('rarity')
				.setDescription('The rarity of the character(s).')
				.setChoices(
					{ name: '⭐⭐⭐⭐⭐', value: '5' },
					{ name: '⭐⭐⭐⭐', value: '4' }
				))
		.addStringOption(option =>
			option
				.setName('weapon')
				.setDescription('The weapon type of the character(s).')
				.setChoices(
					{ name: 'Sword', value: 'Sword' },
					{ 	name: 'Claymore', 	value: 'Claymore' },
					{ 	name: 'Polearm', 	value: 'Polearm' },
					{ 	name: 'Catalyst', 	value: 'Catalyst' },
					{ 	name: 'Bow', 	value: 'Bow' }
				))
		.addStringOption(option =>
			option
				.setName('region')
				.setDescription('The region of the character(s).')
				.setChoices(
					{ name: 'Mondstadt', value: 'Mondstadt' },
					{ name: 'Liyue', value: 'Liyue' },
					{ name: 'Inazuma', value: 'Inazuma' },
					{ name: 'Sumeru', value: 'Sumeru' },
					{ name: 'Fontaine', value: 'Fontaine' },
					{ name: 'Natlan', value: 'Natlan' },
					{ name: 'Snezhnaya', value: 'Snezhnaya' },
					{ name: "Khaenri'ah", value: "Khaenri'ah" }
				)
		),
	async run({ paimonClient, application }) {
		const name = application.options.getString('name');
		const weapon = application.options.getString('weapon');
		const vision = application.options.getString('vision');
		const rarity = application.options.getString('rarity');
		const region = application.options.getString('region');

		const { characters } = paimonClient;
		const character = characters.get(name);

		if (character) {
			const characterInfoEmbed = new MessageEmbed()
				.setTitle(`${character.name}`)
				.setThumbnail(`${character.characterIcon}`)
				.setDescription(`${character.lore}`)
				.addField('Vision', `${paimonClient.utils.parseEmote(character.element)} ${character.element}`, true)
				.addField('Weapon', `${paimonClient.utils.parseEmote(character.weapon)} ${character.weapon}`, true)
				.addField('Region', `${paimonClient.utils.parseEmote(character.region)} ${character.region}`, true)
				.addField('Affiliations', `${character.affiliations.join('\n') || 'None'}`, true)
				.addField('Rarity', `${'⭐'.repeat(character.rarity)}`, true)
				.addField('Constellation', `${character.constellation}`, true)
				.setColor('WHITE');
			return application.followUp({ embeds: [characterInfoEmbed] });
		} else if (weapon || vision || rarity || region) {
			const characterList = characters.filter(char => {
				if (weapon && char.weapon !== weapon) return false;
				if (vision && char.element !== vision) return false;
				if (+rarity && char.rarity !== +rarity) return false;
				if (region && char.region !== region) return false;
				return true;
			}).map(char => char.name).join('\n');

			const title = `${rarity ? `🌟 **Rarity**: \`${rarity}\`\n` : ''}` +
						`${weapon ? `${paimonClient.utils.parseEmote(weapon)} **Weapon**: \`${weapon}\`\n` : ''}` +
						`${vision ? `${paimonClient.utils.parseEmote(vision)} **Vision**: \`${vision}\`\n` : ''}` +
						`${region ? `${paimonClient.utils.parseEmote(region)} **Region**: \`${region}\`\n` : ''}`;

			const filteredCharacterInfoEmbed = new MessageEmbed()
				.setTitle(`Filtered Character Search`)
				.setDescription(`*Using the filters:*\n\n${title}\n\`\`\`${characterList || 'No characters found.'}\`\`\``)
				.setColor('WHITE');
			return application.followUp({ embeds: [filteredCharacterInfoEmbed] });
		} else {
			const characterHelpEmbed = new MessageEmbed()
				.setTitle('Character Help')
				.setDescription('To search for a character.\nType `/character <name>`\nTo filter for certain characters.\nType `/character <weapon>, <vision>, etc...`')
				.setColor('WHITE');

			const uniqueElements = [...new Set(characters.map(char => char.element))];

			for (let i = 0; i < uniqueElements.length; i++) {
				const element = uniqueElements[i];
				const title = `${paimonClient.utils.parseEmote(element)} ${element}`;
				const field = `${characters.filter(char => char.element === element).map(char => char.name).join('\n')}`;

				characterHelpEmbed.addField(title, field, true);
			}

			return application.followUp({ embeds: [characterHelpEmbed] });
		}
	}
};
