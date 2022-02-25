const Event = require('../Structures/Event.js');

module.exports = class extends Event {

	async run(message) {
		if (message.author.bot) return;

		await this.client.level.appendXp(message.author.id, message.guild.id);
	}

};
