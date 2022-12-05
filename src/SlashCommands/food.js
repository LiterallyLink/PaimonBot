const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('food')
		.setDescription('Retrieve information on specific types of food.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the dish.')
				.setRequired(true)
				.setAutocomplete(true)),
	async run({ paimonClient, application }) {
		const name = application.options.getString('name');
		const dish = paimonClient.food.get(name);

		if (dish) {
			const defaultDish = dish.tiers[0];

			const dishEmbed = new MessageEmbed()
				.setTitle(name)
				.setThumbnail(defaultDish.image)
				.setDescription(`**Description**\n${defaultDish.description}\n\n**Effect**\n${defaultDish.effect}\n\n`)
				.addField('Max Rarity', `${'⭐'.repeat(dish.rarity) || 'None'}`, true)
				.addField('Dish Type', `${dish.type || 'None'}`, true)
				.addField('Ingredients', `${dish.recipe.join('\n') || 'No Recipe'}`, true)
				.setColor('WHITE');

			if (dish.tiers.length > 1) {
				const buttonRow = new MessageActionRow()
					.addComponents(
						dish.tiers.map(food =>
							new MessageButton()
								.setCustomId(food.tier)
								.setLabel(food.tier)
								.setStyle('PRIMARY')
						)
					);

				buttonRow.components[0].setDisabled(true);
				const dishMessage = await application.followUp({ embeds: [dishEmbed], components: [buttonRow] });

				const filter = i => i.user.id === application.user.id;
				const collector = dishMessage.createMessageComponentCollector({ filter, time: 180000 });

				return collector.on('collect', async i => {
					i.deferUpdate();
					const choice = i.customId;

					buttonRow.components.filter(comp => comp.disabled ? comp.setDisabled(false) : null);
					buttonRow.components.find(comp => comp.customId === choice).setDisabled(true);

					const tier = dish.tiers.find(variant => variant.tier === choice);

					dishEmbed.setThumbnail(tier.image);
					dishEmbed.setDescription(`\n${tier.description}\n\n**Effect**\n${tier.effect}\n\n`);

					dishMessage.edit({ embeds: [dishEmbed], components: [buttonRow] });
				});
			} else {
				return application.followUp({ embeds: [dishEmbed] });
			}
		} else {
			const randomFood = [...paimonClient.food.keys()][Math.floor(Math.random() * paimonClient.food.size)];

			const dishHelpEmbed = new MessageEmbed()
				.setTitle('Food Command Help')
				.setDescription(`To search for a specific dish.\nType \`/food <name>\`\nExample \`/food ${randomFood}\``)
				.setColor('WHITE');
			return application.followUp({ embeds: [dishHelpEmbed] });
		}
	}
};

