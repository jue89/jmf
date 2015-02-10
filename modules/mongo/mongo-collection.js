/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo/collection',
	inject: [ 'require(bluebird)', 'mongo/collection:*' ]
};

module.exports.factory = function( P, collectionMethods ) {
	
	return collection;

	// Collection instance factory
	function collection( db, name, options ) {
		// Default values
		if( ! options ) options = { w: 1 };

		// Fetch collection and save promise in current instance
		var col = new P( function( resolve, reject ) {

			// Create collection when not created yet
			db.createCollection( name, options, function( err, col ) {
				if( err ) reject( err );
				else resolve( col );
			} );

		} );

		// Install methods
		var methods = {};
		for( var m in collectionMethods ) {

			// Extract method name
			var methodName = m.substring( m.indexOf( ':' ) + 1 );

			// Install proxy function
			methods[methodName] = proxyFactory( col, collectionMethods[m] );

		}

		return methods;
	}

	// Proxy factory for class methods
	function proxyFactory( col, method ) {
		return function() {
			// Save arguments
			var args = arguments;

			// Things that will be done:
			// - Wait for resolved collection instance
			// - Call the proxied method
			return col.then( function( colInstance ) {
				return method( colInstance, args );
			} );
		};
	}
};

