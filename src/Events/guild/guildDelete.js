const Event = require('../../Structures/Event');

module.exports = class extends Event {

	async run(guild) {
		console.log(`--| I just left ${guild.name} |--`);
	}

};
