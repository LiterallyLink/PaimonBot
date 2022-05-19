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

		const structuredInventory = inventory.reduce((acc, cur) => {
			const existing = acc.find(i => i.name === cur);

			if (existing) existing.count++;
			else acc.push({ name: cur, count: 1 });

			return acc;
		}, []);

		const characterArr = [];
		const weaponArr = [];

		for (let i = 0; i < structuredInventory.length; i++) {
			const { name, count } = structuredInventory[i];

			if (characterList.has(name)) {
				const { rarity } = characterList.get(name);
				characterArr.push({ name, rarity, count });
			} else if (weaponList.has(name)) {
				const { rarity } = weaponList.get(name);
				weaponArr.push({ name, rarity, count });
			}
		}

		const totalCharacters = characterArr.reduce((acc, cur) => acc + cur.count, 0);
		const totalWeapons = weaponArr.reduce((acc, cur) => acc + cur.count, 0);
		characterArr.sort((a, b) => b.rarity - a.rarity);
		weaponArr.sort((a, b) => b.rarity - a.rarity);

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

		const inventoryEmbed = new MessageEmbed()
			.setAuthor({ name: `${application.user.username}'s Inventory`, iconURL: application.user.avatarURL() })
			.addField('Total Wishes', `${totalWishes}`, true)
			.addField('Total Characters', `${characterArr.length ? totalCharacters : 'None'}`, true)
			.addField('Total Weapons', `${weaponArr.length ? totalWeapons : 'None'}`, true)
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
				optionRow.components[0].setDisabled(true);
				optionRow.components[1].setDisabled(false);
				const characterEmbed = new MessageEmbed()
					.setAuthor({ name: `${application.user.username}'s Characters`, iconURL: application.user.avatarURL() })
					.setDescription(`${characterArr.length ? characterArr.map(char => `${char.count}x ${char.name}`).join('\n') : "You haven't summoned any characters yet!"}`)
					.setColor('WHITE');
				msg.edit({ embeds: [characterEmbed], components: [optionRow] });
			}

			if (customId === 'weapons') {
				optionRow.components[0].setDisabled(false);
				optionRow.components[1].setDisabled(true);
				const characterEmbed = new MessageEmbed()
					.setAuthor({ name: `${application.user.username}'s Weapon's`, iconURL: application.user.avatarURL() })
					.setDescription(`${weaponArr.length ? weaponArr.map(char => `${char.count}x ${char.name}`).join('\n') : "You haven't pulled any weapons yet!"}`)
					.setColor('WHITE');
				msg.edit({ embeds: [characterEmbed], components: [optionRow] });
			}
		});
	}
};
