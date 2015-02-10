/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'config:default',
	inject: [ 'require(fs)' ]
};

module.exports.factory = function( fs ) { return {
	app: {
		user: null,
		group: null
	},
	https: {
		host: '::',
		port: 8000,
		key: fs.readFileSync( __dirname + '/../pki/test_server.key' ),
		cert: fs.readFileSync( __dirname + '/../pki/test_server.crt' ),
		ca: fs.readFileSync( __dirname + '/../pki/test_ca.crt' )
	},
	mongodb: {
		servers: [ {
			host: 'localhost',
			port: 27017,
			options: { auto_reconnnect: true }
		} ],
		db: 'accounting'
	}
}; };
