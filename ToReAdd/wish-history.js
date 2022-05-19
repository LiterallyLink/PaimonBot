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

		const wishHistoryArray = [];

		for (let i = 0; i < wishHistory.length; i += 10) {
			wishHistoryArray.push(wishHistory.slice(i, i + 10).join('\n'));
		}

		const wishHistoryEmbed = new MessageEmbed()
			.setTitle(`${banner} Banner Wish History`)
			.setFooter({ text: `Page 1 of 1` })
			.setColor('WHITE');

		if (!wishHistoryArray.length) {
			wishHistoryEmbed.setDescription("No Character's or Weapon's to display.");
			return application.followUp({ embeds: [wishHistoryEmbed] });
		} else if (wishHistory.length <= 10) {
			wishHistoryEmbed.setDescription(wishHistoryArray[0]);
			return application.followUp({ embeds: [wishHistoryEmbed] });
		} else {
			const buttonRow = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setLabel('◀️')
						.setCustomId('backward')
						.setStyle('PRIMARY')
						.setDisabled(true),
					new MessageButton()
						.setLabel('▶️')
						.setCustomId('forward')
						.setStyle('PRIMARY'),
					new MessageButton()
						.setLabel('🗑️')
						.setCustomId('delete')
						.setStyle('PRIMARY')
				);

			let page = 0;
			let description = wishHistoryArray[page];
			const maxPages = Math.ceil(wishHistory.length / 10);

			wishHistoryEmbed.setDescription(description);
			wishHistoryEmbed.setFooter({ text: `Page ${page + 1} of ${maxPages}` });
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
					description = wishHistoryArray[page];

					if (page + 1 === maxPages) buttonRow.components[1].setDisabled(true);
					if (page > 0) buttonRow.components[0].setDisabled(false);

					wishHistoryEmbed.setDescription(description);
					wishHistoryEmbed.setFooter({ text: `Page ${page + 1} of ${maxPages}` });
					application.editReply({ embeds: [wishHistoryEmbed], components: [buttonRow] });
				}

				if (customId === 'backward') {
					page--;
					description = wishHistoryArray[page];

					if (page === 0) buttonRow.components[0].setDisabled(true);
					if (page < 1) buttonRow.components[1].setDisabled(false);

					wishHistoryEmbed.setDescription(description);
					wishHistoryEmbed.setFooter({ text: `Page ${page + 1} of ${maxPages}` });
					application.editReply({ embeds: [wishHistoryEmbed], components: [buttonRow] });
				}
			});
		}
	}
};
