const Member = require('../../Models/memberSchema.js');

module.exports = class Level {

	constructor(client) {
		this.client = client;
	}

	async appendXp(userId, guildId) {
		const xpToAdd = this.client.utils.generateRandomInteger(1, 29);

		const member = await Member.findOneAndUpdate({
			userId,
			guildId
		},
		{
			userId,
			guildId,
			$inc: {
				xp: xpToAdd
			},
			$set: {
				lastUpdated: new Date()
			}
		},
		{
			upsert: true,
			new: true
		});

		if (this.xpFor(member.level) < member.xp) {
			await this.levelUp(member);
		}
	}

	async fetchRank(userID, guildID) {
		const rank = await Member.find({ guildId: guildID }).sort([['xp', 'descending']]).exec();
		const rankPosition = rank.findIndex(i => i.userId === userID) + 1;

		return rankPosition;
	}

	xpFor(targetLevel) {
		return targetLevel * targetLevel * 100;
	}

	async levelUp(member) {
		const newLevel = Math.floor(0.1 * Math.sqrt(member.xp));
		await member.updateOne({ $inc: { level: newLevel } });
	}

};
