/* eslint-disable new-cap */
const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true
};

const profileSchema = mongoose.Schema({
	guildId: reqString,
	userId: reqString,
	mora: { type: Number, required: true, default: 0 },
	primogems: { type: Number, required: true, default: 0 },
	gender: reqString,
	birthday: reqString,
	stardust: { type: Number, required: true, default: 0 },
	starglitter: { type: Number, required: true, default: 0 },
	resin: { type: Number, required: true, default: 160 },
	characters: []

});

module.exports = mongoose.model('profile', profileSchema, 'profiles');
