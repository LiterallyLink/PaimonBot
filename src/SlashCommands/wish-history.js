const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wish-history')
		.setDescription("Allow's you to view your wish history.")
		.addStringOption(option =>
			option
				.setName('banner')
				.setDescription('The desired banner type to view wish history of')
				.addChoices([
					['Character Banner', 'Character'],
					['Weapon Banner', 'Weapon'],
					['Standard Banner', 'Standard']
				])
				.setRequired(true)),
	async run({ paimonClient, application }) {
		const banner = application.options.getString('banner');
		const { pity } = await paimonClient.database.fetchPlayerData(application.user.id);
		const { wishHistory } = pity.find(i => i.type === banner.toLowerCase());

		let initialIndex = 0;
		let page = 0;
		let maxPages = Math.ceil(wishHistory.length / 10);
		const descriptionArray = [];
		let description;

		for (let i = 0; i < maxPages; i++) {
			const wishHistoryList = wishHistory.slice(initialIndex, initialIndex + 10).join('\n');
			descriptionArray.push(wishHistoryList);
			initialIndex += 10;
		}

		const buttonRow = new MessageActionRow();

		if (descriptionArray.length < 10) {
			description = "No Character's or Weapon's to display.";
			maxPages = 1;
		} else {
			description = descriptionArray[page];

			buttonRow.addComponents(
				new MessageButton()
					.setLabel('◀️')
					.setCustomId('backward')
					.setStyle('PRIMARY')
					.setDisabled(true)
			);
			buttonRow.addComponents(
				new MessageButton()
					.setLabel('▶️')
					.setCustomId('forward')
					.setStyle('PRIMARY')
			);
		}

		buttonRow.addComponents(
			new MessageButton()
				.setLabel('🗑️')
				.setCustomId('delete')
				.setStyle('PRIMARY')
		);

		const wishHistoryEmbed = new MessageEmbed()
			.setTitle(`${banner} Banner Wish History`)
			.setDescription(`${description}`)
			.setColor('WHITE')
			.setFooter({ text: `Page ${page + 1} of ${maxPages}` });
		const historyEmbed = await application.followUp({ embeds: [wishHistoryEmbed], components: [buttonRow] });

		const filter = i => {
			i.deferUpdate();
			return i.user.id === application.user.id;
		};

		const collector = historyEmbed.createMessageComponentCollector({ filter, time: 300000 });

		return collector.on('collect', async i => {
			const { customId } = i;

			if (customId === 'delete') {
				collector.stop();
				historyEmbed.delete().catch(() => null);
			}

			if (customId === 'forward') {
				page++;
				description = descriptionArray[page];

				if (page + 1 === maxPages) buttonRow.components[1].setDisabled(true);
				if (page > 0) buttonRow.components[0].setDisabled(false);

				wishHistoryEmbed.setDescription(description);
				wishHistoryEmbed.setFooter({ text: `Page ${page + 1} of ${maxPages}` });
				application.editReply({ embeds: [wishHistoryEmbed], components: [buttonRow] });
			}

			if (customId === 'backward') {
				page--;
				description = descriptionArray[page];

				if (page === 0) buttonRow.components[0].setDisabled(true);
				if (page < 1) buttonRow.components[1].setDisabled(false);

				wishHistoryEmbed.setDescription(description);
				wishHistoryEmbed.setFooter({ text: `Page ${page + 1} of ${maxPages}` });
				application.editReply({ embeds: [wishHistoryEmbed], components: [buttonRow] });
			}
		});
	}
};
