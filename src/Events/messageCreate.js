const Event = require('../Structures/Event.js');

module.exports = class extends Event {

	async run(message) {
		if (message.author.bot || this.client.cooldowns.has(message.author.id)) return;

		this.client.cooldowns.add(message.author.id);
		await this.client.level.appendXp(message.author.id, message.guild.id);
		setTimeout(() => this.client.cooldowns.delete(message.author.id), 60000);
	}

};
