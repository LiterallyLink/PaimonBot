const Event = require('../Structures/Event.js');

module.exports = class extends Event {

	async run(message) {
		if (message.author.bot) return;

		const memberData = await this.client.database.fetchMemberData(message.author.id, message.guild.id);
		await this.client.level.appendXp(memberData);
	}

};
