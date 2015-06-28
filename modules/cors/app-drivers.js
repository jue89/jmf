/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'app/drivers:cors',
	inject: [ 'require(cors)', 'config' ],
};

module.exports.factory = function( cors, config ) { return {
	priority: 2, // Register first!!!
	register: function( app ) {

		// Add cors if defined
		if( config.cors ) app.use( cors( config.cors ) );

	}
}; };
