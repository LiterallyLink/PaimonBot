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
			`Cached ${this.client.characters.size} characters`,
			`Cached ${this.client.weapons.size} weapons`,
			`Cached ${this.client.artifacts.size} artifact sets`,
			`Cached ${this.client.artifacts.map(art => art).flat().length} artifacts`
		].join('\n'));


		await this.client.user.setActivity(`EHE TE NANDAYO!`, { type: 'WATCHING' });
	}

};
