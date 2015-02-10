/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo/collection:drop',
	inject: [ 'require(bluebird)', 'schema' ]
};

module.exports.factory = function( P, schema ) {

	// Define schema for get arguments
	var testQuery = schema ( {
		'selector': { type: 'object' }
	} );

	// The exposed function
	return function( col, args ) {
		
		// Arguments
		var query = args[0];
		var options = args[1];

		// Default options
		if( ! options ) options = { w: 1, j: 1 };

		// Things that will be done:
		// - Test query against query schema
		// - Execute the remove query
		return testQuery( query )
			.then( function( query ) { return new P( function( resolve, reject ) {
				col.remove( query.selector, options, function( err, result ) {
					if( err ) return reject( err );
					resolve( result );
				} );
			} ); } );
		
			
	};

};

