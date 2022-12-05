const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('potions')
		.setDescription('Retrieve information on specific potions.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the potion.')
				.setAutocomplete(true)
		),
	async run({ paimonClient, application }) {
		const potionName = application.options.getString('name');
		const { potions } = paimonClient;

		const potion = potions.get(potionName);

		if (potion) {
			const { name, type, recipe, rarity, description, effect, thumbnail } = potion;

			const potionEmbed = new MessageEmbed()
				.setTitle(name)
				.setThumbnail(thumbnail)
				.setDescription(`**Description**\n${description}\n\n**Effect**\n${effect}`)
				.addField('Rarity', '⭐'.repeat(rarity), true)
				.addField('Type', type, true)
				.addField('Recipe', recipe.join('\n'), true)
				.setColor('WHITE');
			return application.followUp({ embeds: [potionEmbed] });
		} else {
			const potionNames = [...potions.keys()];
			const randomPotion = potionNames[Math.floor(Math.random() * potionNames.length)];

			const potionHelpEmbed = new MessageEmbed()
				.setTitle('Potion Command Help')
				.setDescription(`To search for a specific potion.\nType \`/potion <name>\`\nExample \`/potion ${randomPotion}\``)
				.addField('Potion List', potionNames.sort((a, b) => a.length - b.length).join('\n'))
				.setColor('WHITE');
			return application.followUp({ embeds: [potionHelpEmbed] });
		}
	}
};
