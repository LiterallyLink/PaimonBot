const Player = require('../../Models/playerSchema.js');

module.exports = class Economy {

	constructor(client) {
		this.client = client;
	}

	async modifyCurrency(userID, amount, operation) {
		let userProfile = await Player.findOne({ userId: userID });

		if (!userProfile) {
			userProfile = await this.client.database.createPlayerData(userID);
		}

		if (operation === 'add') {
			userProfile.mora += amount;
		} else if (operation === 'subtract') {
			userProfile.mora -= amount;
		}

		userProfile.lastUpdated = Date.now();

		await userProfile.save().catch(err => console.log(err));
	}

	async daily(userID) {
		await this.modifyCurrency(userID, 20000, 'add');

		const userProfile = await Player.findOne({ userId: userID });
		userProfile.dailyLastClaimedAt = Date.now();
		userProfile.save();
	}

};
