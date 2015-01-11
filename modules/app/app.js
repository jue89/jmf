// Fire me up!

module.exports = {
	implements: 'app',
	inject: [ 'require(bluebird)', 'require(https)', 'require(express)', 'require(posix)', 'config', 'app/drivers:*', 'app/routes:*', 'app/errhandlers:*' ],
}

module.exports.factory = function( P, Https, Express, posix, config, drivers, routes, errhandlers ) {

	function register( group, app ) {
		// Collect all modules
		var items = [];
		for( var key in group ) items.push( group[key] );

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

	return new P( function( resolve ) {
		var app = Express();


		// Install drivers
		register( drivers, app );

		// Install routes
		register( routes, app );

		// Install global error handlers
		register( errhandlers, app );
		

		// Create HTTPS server
		var server = Https.createServer( {
			key: config.https.key,
			cert: config.https.cert,
			ca: config.https.ca,
			requestCert: true,
			rejectUnauthorized: true
		}, app );

		// Start server
		server.listen( config.https.port, function() {
			// Drop previleges
			var p = config.app;
			if( p.user && p.group && process.setuid && process.setgid ) {
				if( typeof p.user == 'string' ) p.user = posix.getpwnam( p.user ).uid;
				if( typeof p.group == 'string' ) p.group = posix.getgrnam( p.group ).gid;
				
				process.setuid( p.user );
				process.setgid( p.group );
			}

			return resolve( server );
		} );
	} );
}
