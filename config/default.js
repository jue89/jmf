/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'config:default',
	inject: [ 'require(fs)' ]
};

module.exports.factory = function( fs ) { return {
	discovery: true,
	listen: {
		port: 8000,
		host : '::'
	},
	https: {
		key: fs.readFileSync( __dirname + '/../pki/test_server.key' ),
		cert: fs.readFileSync( __dirname + '/../pki/test_server.crt' ),
		ca: fs.readFileSync( __dirname + '/../pki/test_ca.crt' ),
		requestCert: true,
		rejectUnauthorized: true
	},
	cors: {
		origin: /.*/
	},
	mongodb: {
		servers: [ {
			host: 'localhost',
			port: 27017,
			options: { auto_reconnnect: true }
		} ],
		db: 'jmf'
	}
}; };
