/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo/collection:update',
	inject: [ 'require(bluebird)', 'schema' ]
};

module.exports.factory = function( P, schema ) {

	// Define schema for get arguments
	var testQuery = schema ( {
		'selector': { type: 'object' },
		'modifier.$set': { type: 'object' },
		'modifier.$unset': { type: 'object' },
		'modifier.$rename': { type: 'object' },
		'modifier.$inc': { type: 'object' },
		'modifier.$mul': { type: 'object' },
		'modifier.$min': { type: 'object' },
		'modifier.$max': { type: 'object' },
		'modifier.$currentDate': { type: 'object' }
	} );
	
	return function( col, args ) {

		// Arguments
		var query = args[0];
		var options = args[1];

		// Default options
		if( ! options ) options = { w: 1, j: 1 };
		options.new = true;

		// Agenda:
		// - Test query against query schema
		// - Execute update and return result
		return testQuery( query )
			.then( function( query ) { return new P( function( resolve, reject ) {

				// Send insert request
				col.findAndModify(
					query.selector,
					[['_id',1]],
					query.modifier,
					options,
					function( err, result ) {
						if( err ) reject( err );
						else resolve( result );
					}
				);
			} ); } );

	};

};

