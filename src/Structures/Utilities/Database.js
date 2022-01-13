const Player = require('../../Models/playerSchema.js');

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

};
