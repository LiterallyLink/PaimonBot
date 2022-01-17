const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	mora: { type: Number, default: 0 },
	fishingRod: { type: String, default: 'Wilderness Rod' },
	adventureRank: { type: Number, default: 1 },
	adventureRankEXP: { type: Number, default: 0 },
	worldLevel: { type: Number, default: 0 },
	namecards: { type: Array, default: [] },
	currentCard: { type: String, default: 'default' },
	createdOn: { type: Date, default: new Date().getTime() },
	lastUpdated: { type: Date, default: new Date().getTime() },
	isBlacklisted: { type: Boolean, default: false },
	dailyLastClaimedAt: { type: Date, default: 0 },
	dailyClaimedStreak: { type: Number, default: 0 },
	increasedFiveStarChance: { type: Number, default: 0 }
});

module.exports = mongoose.model('profile', playerSchema, 'profiles');
