const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enemies')
		.setDescription('Retrieve information on specific types of enemies.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the enemy.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('The type of enemy(s).')
				.addChoices(
					{ name: 'Common Enemies', value: 'Common Enemies' },
					{ name: 'Elite Enemies', value: 'Elite Enemies' },
					{ name: 'Special Enemies', value: 'Special Enemies' },
					{ name: 'Normal Bosses', value: 'Normal Bosses' },
					{ name: 'Weekly Bosses', value: 'Weekly Bosses' }
				)),
	async run({ paimonClient, application }) {
		const enemyName = application.options.getString('name');
		const enemyType = application.options.getString('type');

		const { enemies } = paimonClient;
		const enemy = enemies.get(enemyName);

		if (enemy) {
			const { name, thumbnail, type, description, family, group, drops } = enemy;

			const enemyEmbed = new MessageEmbed()
				.setTitle(name)
				.setImage(thumbnail)
				.setDescription(description)
				.addField('Type', type || 'None', true)
				.addField('Family', family || 'None', true)
				.addField('Group', group || 'None', true)
				.addField('Drops', drops.join('\n') || 'None', true)
				.setColor('WHITE');
			application.followUp({ embeds: [enemyEmbed] });
		} if (enemyType) {
			const filteredEnemies = enemies.filter(ene => ene.type === enemyType).map(ene => ene.name).join('\n');

			const filterText = `:dividers: Type: ${enemyType}`;

			const filteredEnemyEmbed = new MessageEmbed()
				.setTitle('Filtered Enemy Search')
				.setDescription(`*Using the filters:*\n\n${filterText}\n\n\`\`\`${filteredEnemies}\`\`\``)
				.setColor('WHITE');
			application.followUp({ embeds: [filteredEnemyEmbed] });
		} else {
			console.log('no');
		}
	}
};
