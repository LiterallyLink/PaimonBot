const { Client, Collection, Intents } = require('discord.js');
const Util = require('./Utilities/Util.js');
const Canvas = require('./Utilities/Canvas');
const Database = require('./Utilities/Database');
const Economy = require('./Utilities/Economy');

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
		this.weapons = 	new Collection();
		this.elements = new Collection();
		this.reactions = new Collection();

		this.utils = new Util(this);
		this.canvas = new Canvas(this);
		this.database = new Database(this);
		this.economy = new Economy(this);
		this.mongoose = require('./Mongo');
	}

	validate(options) {
		if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

		if (!options.token) throw new Error('You must pass the token for the client.');
		this.token = options.token;
	}

	async start(token = this.token) {
		// await this.utils.clearSlashCommands();
		await this.utils.loadSlashCommands();
		this.mongoose.init();
		await this.utils.storeAPIData();
		this.utils.loadEvents();

		await super.login(token);
	}

};
