const Event = require('../Structures/Event.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true
		});
	}

	async run() {
		console.log([
			`Logged in as ${this.client.user.tag}`,
			`Cached ${this.client.elements.size} elements`,
			`Cached ${this.client.characters.size} characters`
		].join('\n'));


		await this.client.user.setActivity(`EHE TE NANDAYO!`, { type: 'WATCHING' });
	}

};
