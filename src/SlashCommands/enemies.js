const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enemies')
		.setDescription("Allow's you to look up specific enemies.")
		.addStringOption(option =>
			option
				.setName('common-enemies')
				.setDescription('Players will often find Common Enemies in the open world while exploring,')
				.addChoices([
					['Slimes', 'slimes'],
					['Specters', 'specters'],
					['Whopperflowers', 'whopperflowers'],
					['Cicins', 'cicins'],
					['Hilichurls', 'hilichurls'],
					['Samachurls', 'samachurls'],
					['Fatui Skirmishers', 'fatui-skirmishers'],
					['Treasure Hoarders', 'treasure-hoarders'],
					['Nobushi', 'nobushi'],
					['Kairagi', 'kairagi']
				])
		)
		.addStringOption(option =>
			option
				.setName('elite-enemies')
				.setDescription('Players will find Elite Enemies in the open world while exploring, or in Domains and Spiral Abyss.')
				.addChoices([
					['Mitachurls', 'mitachurls'],
					['Lawachurls', 'lawachurls'],
					['Abyss Heralds', 'abyss-heralds'],
					['Abyss Lectors', 'abyss-lectors'],
					['Rifthounds Whelps', 'rifthound-whelps'],
					['Humanoid Ruin Machines', 'humanoid-ruin-machines'],
					['Ruin Sentinels', 'ruin-sentinels'],
					['Fatui Cicin Mages', 'fatui-cicin-mages'],
					['Fatui Pyro Agent', 'fatui-pyro-agent'],
					['Mirror Maiden', 'mirror-maiden'],
					['Geovishaps', 'geovishaps'],
					['Bathysmal Vishaps', 'bathysmal-vishaps'],
					['Eye of the Storm', 'eye-of-the-storm'],
					['The Great Snowboar King', 'the-great-snowboar-king']
				])
		)
		.addStringOption(option =>
			option
				.setName('normal-bosses')
				.setDescription('Normal Boss challenges are much stronger than Elite Enemies, but provide better rewards.')
				.addChoices([
					['Hypostases', 'hypostases'],
					['Regisvines', 'regisvines'],
					['Oceanid', 'oceanid'],
					['Primo Geovishap', 'primo-geovishap'],
					['Maguu Kenki', 'maguu-kenki'],
					['Perpetual Mechanical Array', 'perpetual-mechanical-array'],
					['Thunder Manifestation', 'thunder-manifestation'],
					['Golden Wolflord', 'golden-wolflord'],
					['Coral Defenders', 'coral-defenders']
				]))
		.addStringOption(option =>
			option
				.setName('weekly-bosses')
				.setDescription('Weekly Bosses are even more difficult than Normal Bosses and provide even greater rewards.')
				.addChoices([
					['Azhdaha', 'azhdaha'],
					['Childe', 'childe'],
					['Lupus Boreas', 'lupus-boreas'],
					['La Signora', 'la-signora'],
					['Stormterror', 'stormterror']
				])),
	async run({ paimonClient, application }) {
		const input = application.options.getString('common-enemies') || application.options.getString('elite-enemies') ||
		application.options.getString('normal-bosses') || application.options.getString('weekly-bosses');

		if (!input) {
			const enemyListEmbed = new MessageEmbed()
				.setTitle('List of Enemies')
				.setColor('WHITE');

			const enemyRarities = ['Common Enemies', 'Elite Enemies', 'Boss Enemies', 'Weekly Bosses'];

			for (let i = 0; i < enemyRarities.length; i++) {
				const enemyRarity = enemyRarities[i];
				const enemyList = paimonClient.enemies.filter(enemy => enemy.rarity === enemyRarity).map(enemy => enemy.name).join('\n');
				enemyListEmbed.addField(enemyRarity, enemyList, true);
			}

			return application.followUp({ embeds: [enemyListEmbed] });
		}

		const { name, description, types, drops, phases } = paimonClient.enemies.get(input);
		const thumbnail = new MessageAttachment(`.\\assets\\images\\enemies\\${input}.png`);

		const enemyEmbed = new MessageEmbed()
			.setTitle(name)
			.setThumbnail(`attachment://${input}.png`)
			.setDescription(description)
			.setColor('WHITE');

		if (types) enemyEmbed.addField('Enemy Types', types.join('\n'), true);
		if (drops) enemyEmbed.addField('Enemy Drops', drops.join('\n'), true);
		if (phases) enemyEmbed.addField('Enemy Phases', phases.join('\n'), true);

		return application.followUp({ embeds: [enemyEmbed], files: [thumbnail] });
	}
};
