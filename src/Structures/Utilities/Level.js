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

		member.xp += parseInt(xp, 10);
		member.lastUpdated = new Date();

		await member.save().catch(err => console.log(`Failed to append xp: ${err}`));

		return Math.floor(0.1 * Math.sqrt(member.xp -= xp)) < member.level;
	}

	async appendLevel(userId, guildId, levelss) {
		const member = await Member.findOne({ userID: userId, guildID: guildId });

		if (!member) return false;

		member.level += parseInt(levelss, 10);
		member.xp = member.level * member.level * 100;
		member.lastUpdated = new Date();

		member.save().catch(err => console.log(`Failed to append level: ${err}`));

		return member;
	}

	xpFor(targetLevel) {
		return targetLevel * targetLevel * 100;
	}

};
