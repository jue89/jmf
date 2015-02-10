/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo/collection:index',
	inject: [ 'require(bluebird)' ]
};

module.exports.factory = function( P ) { return function( col, args ) {

	// Arguments
	var fields = args[0];
	var options = args[1];

	// Rewrite fields
	if( ! ( fields instanceof Array ) ) fields = [ fields ];
	var index = {};
	fields.forEach( function( f ) {
		index[f] = 1;
	} );
	
	// Default options
	if( ! options ) options = {};

	return new P( function( resolve, reject ) {

		// Send ensureIndex request
		col.ensureIndex( index, options, function( err, result ) {
			if( err ) reject( err );
			else resolve();
		} );

	} );

}; };

