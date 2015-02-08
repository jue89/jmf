/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'config:production',
	inject: [ 'require(fs)', 'config:default' ]
};

module.exports.factory = function( fs, config ) {
	config.app.user = 'www-data';
	config.app.group = 'www-data';

	config.https.port = 443;

	return config;
};
