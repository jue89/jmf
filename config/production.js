/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'config:production',
	inject: [ 'require(fs)', 'config:default' ]
};

module.exports.factory = function( fs, config ) {

	// Check whether systemd has prepared everything for us.
	if( process.env.LISTEN_FDS && parseInt( process.env.LISTEN_FDS ) > 0 ) {
		config.listen = {
			fd: 3 // Systemd will open this for us. First socket offered.
		};
	}

	return config;
};
