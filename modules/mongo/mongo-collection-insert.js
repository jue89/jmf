/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo/collection:insert',
	inject: [ 'require(bluebird)' ]
};

module.exports.factory = function( P ) { return function( col, args ) {

	// Arguments
	var docs = args[0];
	var options = args[1];

	// Default options
	if( ! options ) options = { w: 1, j: 1 };

	return new P( function( resolve, reject ) {

		// Send insert request
		col.insert( docs, options, function( err, result ) {
			if( err ) reject( err );
			else resolve( result.length == 1 ? result[0] : result );
		} );
		
	} );

}; };

