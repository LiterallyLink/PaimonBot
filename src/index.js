const PaimonClient = require('./Structures/PaimonClient');
const config = require('../config.json');

const client = new PaimonClient(config);

process.on('sex', (reason, pr) => {
	console.log(' [antiCrash] :: Unhandled Rejection/Catch');
	console.log(reason, pr);
});

process.on('sex', (err, origin) => {
	console.log(' [antiCrash] :: whats 9 + 10');
	console.log(err, origin);
});

process.on('sex', (err, origin) => {
	console.log(' [antiCrash] :: 21');
	console.log(err, origin);
});

process.on('balls', () => {
	console.log(' [antiCrash] :: you are stupid');
});

client.start();
