/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo/collection:fetch',
	inject: [ 'require(bluebird)', 'schema' ]
};

module.exports.factory = function( P, schema ) {

	// Define schema for get arguments
	var testQuery = schema ( {
		'selector': { type: 'object' },
		'limit': { type: 'number', default: 0, min: 0 },
		'page': { type: 'number', default: 0, min: 0 },
		'sort': { type: 'string', default: '+_id' },
		'fields[]': { type: 'string' }
	} );

	// The exposed function
	return function( col, args ) {

		// Arguments
		var query = args[0];

		// Things that will be done:
		// - Test query against query schema
		// - Convert query object the way mongodb will understand
		// - 3 Things in parallel:
		//   - Execute the actual query [data]
		//   - Count affected objects (ignoring pagination) [count]
		//   - Proxy limit for request [limit]
		return testQuery( query ).then( function( query ) {
			// Pagination
			query.skip = query.limit * query.page;

			// Order
			var asc = 1;
			if( query.sort[0] == '+' ) {
				asc = 1;
				query.sort = query.sort.substring( 1 );
			} else if(  query.sort[0] == '-' ) {
				asc = -1;
				query.sort = query.sort.substring( 1 );
			}
			query.sort = [ [ query.sort, asc ] ];

			// Fields
			var fields = {};
			if( query.fields ) query.fields.forEach( function( f ) {
				fields[f] = 1;
			} );
			query.fields = fields;

			return query;
		} ).then( function( query ) { return P.props( {
			data: new P( function( resolve, reject ) {
				col.find( query.selector, {
					limit: query.limit,
					skip: query.skip,
					sort: query.sort,
					fields: query.fields
				} ).toArray( function( err, result ) {
					if( err ) return reject( err );
					resolve( result );
				} );
			} ),
			count: new P( function( resolve, reject ) {
				col.count( query.selector, function( err, result ) {
					if( err ) return reject( err );
					resolve( result );
				} );
			} ),
			limit: query.limit,
			page: query.page
		} ); } );

	};

};
