module.exports = class SlashCommand {

	constructor(client, name, options = {}) {
		this.client = client;
		this.name = options.name || name;
		this.description = options.description || 'No description provided.';
		this.category = options.category || 'General';
		this.usage = `\`${this.name} ${options.usage || ''}\``.trim();
	}

	// eslint-disable-next-line no-unused-vars
	async run(message, args) {
		throw new Error(`Command ${this.name} doesn't provide a run method!`);
	}

	reload() {
		return this.store.load(this.file.path);
	}

};
