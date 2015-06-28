/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'app',
	inject: [
		'require(bluebird)',
		'require(https)',
		'require(express)',
		'config',
		'app/drivers:*',
		'app/routes:*',
		'app/errhandlers:*'
	]
};

module.exports.factory = function( P, Https, Express, config, drivers, routes, errhandlers ) {

	return new P( function( resolve ) {
		var app = new Express();


		// Install drivers
		register( drivers, app );

		// Install routes
		register( routes, app );

		// Install global error handlers
		register( errhandlers, app );


		// Create HTTPS server
		var server = Https.createServer( config.https, app );

		// Start server
		server.listen( config.listen, function() {
			return resolve( server );
		} );
	} );

	// Helper function to register modules with the Express app
	function register( group, app ) {

		// Collect all modules
		var items = [];
		for( var key in group ) {
			if( group[key] && group[key].register && typeof group[key].register == 'function'
			) {
				if( ! group[key].priority ) group[key].priority = 0;
				items.push( group[key] );
			}
		}

		// Order modules by priority starting with highest prio
		items.sort( function( a, b ) {
			if( typeof a.priority == 'number' && typeof b.priority == 'number' ) {
				if( a.priority == b.priority ) {
					return 0;
				} else if( a.priority < b.priority ) {
					return 1;
				} else {
					return -1;
				}
			} else {
				return 0;
			}
		} );

		// Call register function of each module
		items.forEach( function( i ) {
			i.register( app );
		} );

	}

};
