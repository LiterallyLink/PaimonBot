const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription("View a list of weapons and characters you've pulled"),
	async run({ paimonClient, application }) {
		const { inventory, totalWishes } = await paimonClient.database.fetchPlayerData(application.user.id);
		const characterList = paimonClient.characters;
		const weaponList = paimonClient.weapons;

		const characters = [];
		const weapons = [];

		for (let i = 0; i < inventory.length; i++) {
			const { name, count } = inventory[i];

			if (characterList.has(name)) {
				const { rarity } = characterList.get(name);
				characters.push({ name, rarity, count });
			} else if (weaponList.has(name)) {
				const { rarity } = weaponList.get(name);
				weapons.push({ name, rarity, count });
			}
		}

		const optionRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('characters')
					.setLabel('Characters')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomId('weapons')
					.setLabel('Weapons')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle('PRIMARY')
			);

		let totalCharacters = 0;
		let totalWeapons = 0;

		for (let i = 0; i < characters.length; i++) {
			totalCharacters += characters[i].count;
		}

		for (let i = 0; i < weapons.length; i++) {
			totalWeapons += weapons[i].count;
		}

		const inventoryEmbed = new MessageEmbed()
			.setTitle('Inventory')
			.addField('Total Wishes', `${totalWishes}`, true)
			.addField('Characters', `${characters.length ? totalCharacters : 'None'}`, true)
			.addField('Weapons', `${weapons.length ? totalWeapons : 'None'}`, true)
			.setColor('WHITE');
		const msg = await application.followUp({ embeds: [inventoryEmbed], components: [optionRow] });

		const filter = i => i.user.id === application.user.id;

		const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

		return collector.on('collect', async i => {
			i.deferUpdate();
			const { customId } = i;

			if (customId === 'delete') {
				collector.stop();
				msg.delete().catch(() => null);
			}

			if (customId === 'characters') {
				const characterEmbed = new MessageEmbed()
					.setTitle('Characters')
					.setColor('WHITE');

				for (let j = 0; j < 2; j++) {
					const rarity = j + 4;

					const filteredCharList = characters.filter(char => char.rarity === rarity).sort((a, b) => b.count - a.count);
					if (!filteredCharList.length) continue;

					characterEmbed.addField(`${rarity} ⭐`, `${filteredCharList.map(char => `${char.count}x ${char.name}`).join('\n')}`, true);
				}

				application.editReply({ embeds: [characterEmbed], components: [optionRow] });
			}

			if (customId === 'weapons') {
				const weaponEmbed = new MessageEmbed()
					.setTitle('Weapons')
					.setColor('WHITE');

				for (let j = 0; j < 3; j++) {
					const rarity = j + 2;

					const filteredWeaponList = weapons.filter(weap => weap.rarity === rarity).sort((a, b) => b.count - a.count);
					if (!filteredWeaponList.length) continue;

					weaponEmbed.addField(`${rarity} ⭐`, `${filteredWeaponList.map(weap => `${weap.count}x ${weap.name}`).join('\n')}`, true);
				}

				application.editReply({ embeds: [weaponEmbed], components: [optionRow] });
			}
		});
	}
};
