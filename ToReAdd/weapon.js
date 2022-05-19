const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment, MessageButton, MessageActionRow } = require('discord.js');
const { bow, catalyst, claymore, polearm, sword } = require('../../assets/emotes.json');
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
			const weapon = weaponList.get(weaponGuess);
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
			let filteredWeapons = weaponList;

			if (weaponRarity) {
				weaponTitle += `${weaponRarity} Star`;
				filteredWeapons = filteredWeapons.filter(weap => `${weap.rarity}` === weaponRarity);
			}

			if (weaponType) {
				weaponTitle += ` ${weaponType}`;
				filteredWeapons = filteredWeapons.filter(weap => weap.type === weaponType);
			}

			const { image } = filteredWeapons.values().next().value;

			const weaponEmbed = new MessageEmbed()
				.setTitle(`${weaponTitle} Weapons`)
				.setThumbnail(image)
				.setDescription(filteredWeapons.map(weap => `${weap.name}`).join('\n') || 'No weapons found.')
				.setColor('WHITE');
			return application.followUp({ embeds: [weaponEmbed] });
		}

		const optionRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Bow')
					.setEmoji(bow)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('Catalyst')
					.setEmoji(catalyst)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('Claymore')
					.setEmoji(claymore)
					.setStyle('PRIMARY')
			);

		const optionRow2 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Polearm')
					.setEmoji(polearm)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('Sword')
					.setEmoji(sword)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle('PRIMARY')
			);

		const weaponEmbed = new MessageEmbed()
			.setTitle('Weapon Help Menu')
			.setDescription('To search for a specific weapon.\nType `/weapon <weapon name>`\n\nTo filter for certain weapons.\nType `/weapon <type> or <rarity>`')
			.setColor('WHITE');
		const msg = await application.followUp({ embeds: [weaponEmbed], components: [optionRow, optionRow2] });

		const filter = i => {
			i.deferUpdate();
			return i.user.id === application.user.id;
		};

		const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

		return collector.on('collect', async i => {
			const { customId } = i;

			if (customId === 'delete') {
				collector.stop();
				msg.delete().catch(() => null);
			}

			const filteredWeaponsMap = weaponList.filter(j => j.type === customId);
			const thumbnail = new MessageAttachment(`.\\assets\\images\\other\\${customId}.png`, `${customId}.png`);

			const weaponTypeEmbed = new MessageEmbed()
				.setTitle(`${customId} Weapons`)
				.setThumbnail(`attachment://${thumbnail.name}`)
				.setColor('WHITE');

			for (let j = 5; j > 2; j--) {
				const starRarity = Array(j).fill('⭐').join('');
				const formattedWeaponList = filteredWeaponsMap.filter(weap => weap.rarity === j).map(weap => weap.name).join('\n');
				weaponTypeEmbed.addField(`${starRarity}`, formattedWeaponList, true);
			}

			msg.edit({ embeds: [weaponTypeEmbed], components: [optionRow, optionRow2], files: [thumbnail] });
		});
	}
};
