const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const emote = require('../../assets/emotes.json');
const stringSimilarity = require('string-similarity');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weapon')
		.setDescription('Retrieve information on specific weapons.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the weapon.'))
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('The type of weapon.')
				.addChoices([
					['Bow', 'Bow'],
					['Polearm', 'Polearm'],
					['Catalyst', 'Catalyst'],
					['Sword', 'Sword'],
					['Claymore', 'Claymore']
				]))
		.addStringOption(option =>
			option
				.setName('rarity')
				.setDescription('The rarity of the weapon.')
				.addChoices([
					['⭐', '1'],
					['⭐⭐', '2'],
					['⭐⭐⭐', '3'],
					['⭐⭐⭐⭐', '4'],
					['⭐⭐⭐⭐⭐', '5']
				])),
	async run({ paimonClient, application }) {
		const weaponName = application.options.getString('name');
		const weaponType = application.options.getString('type');
		const weaponRarity = application.options.getString('rarity');
		const weaponList = paimonClient.weapons;

		if (weaponName) {
			const weaponGuess = stringSimilarity.findBestMatch(weaponName, weaponList.map(weap => weap.name)).bestMatch.target;
			const weapon = weaponList.find(weap => weap.name === weaponGuess);
			const starRarity = Array(weapon.rarity).fill('⭐').join('');

			const weaponEmbed = new MessageEmbed()
				.setTitle(weapon.name)
				.setThumbnail(weapon.image)
				.setDescription(`${weapon.description}`)
				.addField(`${weapon.abilityName}`, `${weapon.abilityDescription}`)
				.addField('Type', `${weapon.type}`, true)
				.addField('Rarity', `${starRarity}`, true)
				.addField('Source', `${weapon.location}`, true)
				.addField('Base ATK', `${weapon.baseAtk}`, true)
				.addField('Secondary Stat', `${weapon.subStatType}`, true)
				.setColor('WHITE');
			return application.followUp({ embeds: [weaponEmbed] });
		} else if (weaponType || weaponRarity) {
			let weaponTitle = '';
			let mappedWeaponList = weaponList.map(weap => weap);

			if (weaponRarity) {
				weaponTitle += `${weaponRarity} Star`;
				mappedWeaponList = mappedWeaponList.filter(weap => `${weap.rarity}` === weaponRarity);
			}

			if (weaponType) {
				weaponTitle += ` ${weaponType}`;
				mappedWeaponList = mappedWeaponList.filter(weap => weap.type === weaponType);
			}

			const weaponEmbed = new MessageEmbed()
				.setTitle(`${weaponTitle} Weapons`)
				.setThumbnail(mappedWeaponList[0]?.image)
				.setDescription(mappedWeaponList.map(weap => `${weap.name}`).join('\n') || 'No weapons found.')
				.setColor('WHITE');
			return application.followUp({ embeds: [weaponEmbed] });
		}

		const weaponListEmbed = new MessageEmbed()
			.setTitle('Weapon Help')
			.setThumbnail('https://i.ibb.co/Wz8rSRF/Icon-Inventory-Weapons.png')
			.setDescription('To search for a specific weapon.\nType `/weapon <weapon name>`\nTo filter for certain weapons.\nType `/weapon <type> or <rarity>`');

		const weaponTypeList = [...new Set(weaponList.map(weap => weap.type))];

		for (let i = 0; i < weaponTypeList.length; i++) {
			weaponListEmbed.addField(`${emote[weaponTypeList[i].toLowerCase()]} ${weaponTypeList[i]}`,
				`${weaponList.filter(weap => weap.type === weaponTypeList[i]).map(weap => weap.name).join('\n')}`, true);
		}
		return application.followUp({ embeds: [weaponListEmbed] });
	}
};