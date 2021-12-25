const PaimonClient = require('./Structures/PaimonClient');
const config = require('../config.json');
// const { teyToken } = config;
// const Teyvat = require('@teyvatdev/node-sdk').default;

const client = new PaimonClient(config);
// client.tey = new Teyvat(teyToken, {
//	aggressive: true
// });

process.on('unhandledRejection', (reason, pr) => {
	console.log(' [antiCrash] :: Unhandled Rejection/Catch');
	console.log(reason, pr);
});

process.on('uncaughtException', (err, origin) => {
	console.log(' [antiCrash] :: Uncaught Exception/Catch');
	console.log(err, origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
	console.log(err, origin);
});

process.on('multipleResolves', () => {
	console.log(' [antiCrash] :: Multiple Resolves');
});

client.start();
