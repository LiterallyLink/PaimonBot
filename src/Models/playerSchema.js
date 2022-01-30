const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	mora: { type: Number, default: 0 },
	inventory: { type: Array, default: [] },
	namecards: { type: Array, default: [] },
	currentCard: { type: String, default: 'Default' },
	totalWishes: { type: Number, default: 0 },
	pity: { type: Array, default: [
		{
			type: 'standard',
			totalWishes: 0,
			fourStarPity: 0,
			fiveStarPity: 0,
			wishHistory: []
		},
		{
			type: 'weapon',
			totalWishes: 0,
			fourStarPity: 0,
			fiveStarPity: 0,
			wishHistory: []
		},
		{
			type: 'character',
			totalWishes: 0,
			fourStarPity: 0,
			fiveStarPity: 0,
			wishHistory: []
		}
	] },
	createdOn: { type: Date, default: new Date().getTime() },
	lastUpdated: { type: Date, default: new Date().getTime() },
	dailyLastClaimedAt: { type: Date, default: 0 },
	dailyClaimedStreak: { type: Number, default: 0 }
});

module.exports = mongoose.model('profile', playerSchema, 'profiles');
