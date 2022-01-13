const Player = require('../../Models/playerSchema.js');

module.exports = class Economy {

	constructor(client) {
		this.client = client;
	}

	async modifyCurrency(userID, amount, type, operation) {
		let userProfile = await Player.findOne({ userId: userID });

		if (!userProfile) {
			userProfile = await this.client.database.createPlayerData(userID);
		}

		if (operation === 'add') {
			userProfile[type] += amount;
		} else if (operation === 'subtract') {
			userProfile[type] -= amount;
		}

		userProfile.lastUpdated = Date.now();

		await userProfile.save().catch(err => console.log(err));
	}

	async daily(userID) {
		await this.modifyCurrency(userID, 160, 'primogems', 'add');
		await this.modifyCurrency(userID, 20000, 'mora', 'add');

		const userProfile = await Player.findOne({ userId: userID });
		userProfile.dailyLastClaimedAt = Date.now();
		userProfile.save();
	}

};
