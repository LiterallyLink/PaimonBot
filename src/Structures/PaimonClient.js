const { Client, Collection, Intents } = require('discord.js');
const Util = require('./Utilities/Util.js');

module.exports = class PaimonClient extends Client {

	constructor(options = {}) {
		super({
			intents: new Intents(14287),
			allowedMentions: {
				parse: ['users']
			}
		});

		this.validate(options);

		this.slashCommands = new Collection();
		this.events = new Collection();
		this.characters = new Collection();
		this.artifacts = new Collection();
		this.consumables = new Collection();
		this.elements = new Collection();
		this.domains = new Collection();
		this.enemies = new Collection();
		this.materials = new Collection();
		this.nations = new Collection();
		this.weapons = 	new Collection();
		this.utils = new Util(this);
	}

	validate(options) {
		if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

		if (!options.token) throw new Error('You must pass the token for the client.');
		this.token = options.token;

		if (!options.prefix) throw new Error('You must pass a prefix for the client.');
		if (typeof options.prefix !== 'string') throw new TypeError('Prefix should be a type of String.');
		this.prefix = options.prefix;
	}

	async start(token = this.token) {
		// await this.utils.clearSlashCommands();
		await this.utils.loadSlashCommands();
		await this.utils.storeAPIData();
		this.utils.loadEvents();

		await super.login(token);
	}

};
