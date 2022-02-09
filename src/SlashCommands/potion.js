const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('potion')
		.setDescription("Allow's you to look up specific potions.")
		.addStringOption(option =>
			option
				.setName('atk-boosting')
				.setDescription('Look up ATK boosting potions.')
				.addChoices([
					['Gushing Essential Oil', 'gushing-essential-oil'],
					['Frosting Essential Oil', 'frosting-essential-oil'],
					['Shocking Essential Oil', 'shocking-essential-oil'],
					['Unmoving Essential Oil', 'unmoving-essential-oil'],
					['Streaming Essential Oil', 'streaming-essential-oil'],
					['Flaming Essential Oil', 'flaming-essential-oil']
				])
		)
		.addStringOption(option =>
			option
				.setName('def-boosting')
				.setDescription('Look up the DEF-Boosting potions.')
				.addChoices([
					['Windbarrier Potion', 'windbarrier-potion'],
					['Frostshield Potion', 'frostshield-potion'],
					['Insulation Potion', 'insulation-potion'],
					['Dustproof Potion', 'dustproof-potion'],
					['Desiccant Potion', 'desiccant-potion'],
					['Heatshield Potion', 'heatshield-potion']
				])
		),
	async run({ paimonClient, application }) {
		const potion = application.options.getString('atk-boosting') || application.options.getString('def-boosting');
		const { name, emote, rarity, type, description, effect, recipe } = paimonClient.potions.get(potion);
		const starRarity = Array(rarity).fill('⭐').join('');

		const potionEmbed = new MessageEmbed()
			.setTitle(name)
			.setDescription(`${description}\n\n**Effect:**\n${effect}`)
			.addField('Rarity', starRarity, true)
			.addField('Type', `${emote} ${type}`, true)
			.addField('Recipe', recipe.join('\n'), true)
			.setColor('WHITE');
		return application.followUp({ embeds: [potionEmbed] });
	}
};
