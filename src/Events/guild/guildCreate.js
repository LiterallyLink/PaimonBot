const Event = require('../../Structures/Event');

module.exports = class extends Event {

	async run(guild) {
		const channel = guild.channels.cache.find(ch => ch.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));

		console.log(`I joined ${guild.name}`);
	}

};
