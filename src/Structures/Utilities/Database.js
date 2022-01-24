const Player = require('../../Models/playerSchema.js');
const Member = require('../../Models/memberSchema.js');

module.exports = class Database {

	constructor(client) {
		this.client = client;
	}

	async fetchPlayerData(userID) {
		let userProfile = await Player.findOne({ userId: userID });

		if (!userProfile) {
			userProfile = await this.createPlayerData(userID);
		}

		return userProfile;
	}

	async createPlayerData(userID) {
		const newPlayer = new Player({ userId: userID });

		await newPlayer.save().catch(err => console.log(err));

		return newPlayer;
	}

	async fetchMemberData(userID, guildID) {
		let memberProfile = await Member.findOne({ userId: userID, guildId: guildID });

		if (!memberProfile) {
			memberProfile = await this.createMemberData(userID, guildID);
		}

		return memberProfile;
	}

	async createMemberData(userID, guildID) {
		const newMember = new Member({ userId: userID, guildId: guildID, level: 1, xp: 0, lastUpdated: Date.now() });

		await newMember.save().catch(err => console.log(err));

		return newMember;
	}

};
