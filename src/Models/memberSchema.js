const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	guildId: { type: String, required: true },
	xp: { type: Number, default: 0 },
	level: { type: Number, default: 1 }
});

module.exports = mongoose.model('member', memberSchema, 'members');
