const Event = require('../Structures/Event.js');

module.exports = class extends Event {

	async run(message) {
		if (message.author.bot) return;

		await this.client.database.fetchPlayerData(message.author.id);
		console.log(this.client.utils.generateRandomInteger(0, 31));
	}

};
