/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo',
	inject: [ 'require(bluebird)', 'require(mongodb)', 'mongo/collection', 'config' ]
};

module.exports.factory = function( P, Mongo, collectionFactory, config ) {

	var Server = Mongo.Server;
	var ReplSetServers = Mongo.ReplSetServers;
	var Db = Mongo.Db;

	// Configure server connection
	var server;
	if( config.mongodb.servers instanceof Array ) {

		// Server Cluster
		var cluster = [];
		config.mongodb.servers.forEach( function(s) {
			cluster.push( new Server( s.host, s.port || 27017, s.options || {} ) );
		} );

		server = new ReplSetServers( cluster );

	} else {

		// Single Server
		var s = config.mongodb.servers;
		server = new Server( s.host, s.port || 27017, s.options || {} );

	}

	// Configrue database access
	var db = new Db( config.mongodb.db, server, { native_parser: true, w: 1 } );

	// Connect to database exposing a promise
	return new P( function( resolve, reject ) {

		// Try to connect to cluster 
		db.open( function( err, connection ) {

			// On connection errors reject promise otherwise return factory for further db operations
			if( err ) reject( err );
			else resolve( {
				collection: function( name, options ) {
					return collectionFactory( connection, name, options );
				}
			} );
		} );
	} );

};
