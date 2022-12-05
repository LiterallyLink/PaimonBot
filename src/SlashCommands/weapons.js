const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weapons')
		.setDescription('Retrieve information on specific types of weapons.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the weapon.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('The type of weapon(s)')
				.setChoices(
					{ name: 'Sword', value: 'Sword' },
					{ 	name: 'Claymore', 	value: 'Claymore' },
					{ 	name: 'Polearm', 	value: 'Polearm' },
					{ 	name: 'Catalyst', 	value: 'Catalyst' },
					{ 	name: 'Bow', 	value: 'Bow' }
				))
		.addStringOption(option =>
			option
				.setName('rarity')
				.setDescription('The rarity of weapon(s)')
				.setChoices(
					{ name: '⭐⭐⭐⭐⭐', value: '5' },
					{ name: '⭐⭐⭐⭐', value: '4' },
					{ name: '⭐⭐⭐', value: '3' },
					{ name: '⭐⭐', value: '2' },
					{ name: '⭐', value: '1' }
				)),
	async run({ paimonClient, application }) {
		const weaponName = application.options.getString('name');
		const weaponType = application.options.getString('type');
		const weaponRarity = application.options.getString('rarity');

		const { weapons } = paimonClient;

		const weapon = weapons.get(weaponName);

		if (weapon) {
			const { name, rarity, type, lore, passive, baseThumbnail, obtain, refinement, baseATK, statType, statValue } = weapon;

			const weaponEmbed = new MessageEmbed()
				.setTitle(name)
				.setThumbnail(baseThumbnail)
				.setDescription(`${lore}\n\n** ${passive} **\n${refinement.pop()}`)
				.addField('Type', type, true)
				.addField('Rarity', `${'⭐'.repeat(rarity)}`, true)
				.addField('Source', obtain.join('\n'), true)
				.addField('Base ATK (Lv. 1 - 90)', baseATK, true)
				.setColor('WHITE');
			if (statValue) weaponEmbed.addField(statType, statValue, true);

			return application.followUp({ embeds: [weaponEmbed] });
		} else if (weaponType || weaponRarity) {
			const weaponList = weapons.filter(weap => {
				if (weaponType && weap.type !== weaponType) return false;
				if (+weaponRarity && weap.rarity !== +weaponRarity) return false;
				return true;
			}).map(weap => weap.name).join('\n');

			const title = `${weaponRarity ? `🌟 **Rarity**: \`${weaponRarity}\`\n` : ''}${weaponType ? `${paimonClient.utils.parseEmote(weaponType)} **Type**: \`${weaponType}\`\n` : ''}`;

			const weaponHelpEmbed = new MessageEmbed()
				.setTitle('Filtered Weapon Search')
				.setDescription(`*Using the filters:*\n\n${title}\n\`\`\`${weaponList || 'No weapons found.'}\`\`\``)
				.setColor('WHITE');
			return application.followUp({ embeds: [weaponHelpEmbed] });
		} else {
			const weaponHelpEmbed = new MessageEmbed()
				.setTitle('Weapon Help')
				.setDescription(`To search for a specific weapon.\nType \`/weapon <name>\`\nTo filter for certain weapons.\nType \`/weapon <type>, <star>, etc...\``)
				.setColor('WHITE');
			return application.followUp({ embeds: [weaponHelpEmbed] });
		}
	}
};
