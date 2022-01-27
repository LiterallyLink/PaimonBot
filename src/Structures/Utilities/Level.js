const Member = require('../../Models/memberSchema.js');

module.exports = class Level {

	constructor(client) {
		this.client = client;
	}

	async appendXp(userId, guildId) {
		const xp = this.client.utils.generateRandomInteger(1, 29);

		let member = await Member.findOne({ userID: userId, guildID: guildId });

		if (!member) {
			member = await this.client.database.createMemberData(userId, guildId);
		}

		member.xp += xp;

		member.level = Math.floor(0.1 * Math.sqrt(member.xp));
		member.lastUpdated = new Date();

		await member.save().catch(err => console.log(`Failed to append xp: ${err}`));

		return Math.floor(0.1 * Math.sqrt(member.xp -= xp)) < member.level;
	}

	async fetchRank(userID, guildID) {
		const rank = await Member.find({ guildId: guildID }).sort([['xp', 'descending']]).exec();
		const rankPosition = rank.findIndex(i => i.userId === userID) + 1;

		return rankPosition;
	}

	xpFor(targetLevel) {
		return targetLevel * targetLevel * 100;
	}

};
