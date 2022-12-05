/* eslint-disable consistent-return */
const Event = require('../Structures/Event.js');

module.exports = class extends Event {

	async run(interaction) {
		// Slash Command Handling
		if (interaction.isCommand()) {
			await interaction.deferReply({ ephemeral: false }).catch();

			const cmd = this.client.slashCommands.get(interaction.commandName);
			if (!cmd) { return interaction.followUp({ content: 'An error has occured ' }); }

			const args = [];

			for (const option of interaction.options.data) {
				if (option.type === 'SUB_COMMAND') {
					if (option.name) args.push(option.name);
					option.options?.forEach((subCmd) => {
						if (subCmd.value) args.push(subCmd.value);
					});
				} else if (option.value) { args.push(option.value); }
			}
			interaction.member = interaction.guild.members.cache.get(interaction.user.id);

			return cmd.run({ paimonClient: this.client, application: interaction, arguments: args });
		}

		// Context Menu Handling
		if (interaction.isContextMenu()) {
			await interaction.deferReply({ ephemeral: false });
			const command = this.client.slashCommands.get(interaction.commandName);
			if (command) command.run(this.client, interaction);
		}

		// Autocomplete handling
		if (interaction.isAutocomplete()) {
			const focusedOption = interaction.options.getFocused(true);
			let choices;

			if (interaction.commandName === 'characters') choices = [...this.client.characters.keys()];
			if (interaction.commandName === 'artifacts') choices = [...this.client.artifacts.keys()];
			if (interaction.commandName === 'food') choices = [...this.client.food.keys()];
			if (interaction.commandName === 'potions') choices = [...this.client.potions.keys()];
			if (interaction.commandName === 'weapons') choices = [...this.client.weapons.keys()];

			if (interaction.commandName === 'enemies') {
				choices = [...this.client.enemies.keys()];
			}

			await interaction.respond(this.onAutoComplete(focusedOption.value, choices));
		}
	}

	onAutoComplete(value, choicesArray) {
		const filtered = choicesArray.filter(choice => choice.startsWith(value));
		const filteredList = filtered.length < 25 ? filtered : filtered.slice(0, 25);
		return filteredList.map(choice => ({ name: choice, value: choice }));
	}

};

