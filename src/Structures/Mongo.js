const mongoose = require('mongoose');
const { mongoPath } = require('../../config.json');

module.exports = {
	init: () => {
		const dbOptions = {
			autoIndex: false,
			maxPoolSize: 5,
			connectTimeoutMS: 10000,
			family: 4
		};

		mongoose.connect(mongoPath, dbOptions);
		mongoose.Promise = global.Promise;

		mongoose.connection.on('connected', () => {
			console.log('Successfully connected to the database.');
		});

		mongoose.connection.on('err', err => {
			console.error(`Mongoose connection error: \n${err.stack}`);
		});

		mongoose.connection.on('disconnected', () => {
			console.warn('Disconnected from the database.');
		});
	}
};
