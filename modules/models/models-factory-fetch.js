/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'models/factory:fetch',
	inject: [ 'require(bluebird)', 'models/error', 'hooks', 'schema' ]
};

module.exports.factory = function( P, ModelsError, getHooks, schema ) { return function( models, resources, resource ) {

	var name = resource.name;

	// Obtain hooks
	var globalHooks = getHooks( 'global', [ 'pre', 'post' ] );
	var hooks = getHooks( name, [ 'preFetch', 'postFetch' ] );

	// Test query
	var testQuery = schema ( {
		'req.selector': { type: 'object', default: {} },
		'req.limit': { type: 'number', default: 0 },
		'req.page': { type: 'number', default: 0 },
		'req.sort': { type: 'string', default: '+_id' },
		'req.fields': { type: 'object', default: {} },
		'req.include': { type: 'array', default: [] }
	}, true );
	

	// Returns the fetch function
	return function( query ) {
		if( typeof query != 'object' ) query = {};

		// Reference current models object
		query.self = models;

		// Things going to happen:
		// - Check query
		// - Call global hooks (global.pre)
		// - Call model.preInsert hooks
		// - Check for all requested includes
		// - Fetch from database
		// - Create response object
		// - Call model.postInsert hooks
		// - Call global hooks (global.post)
		return testQuery( query )
			.then( globalHooks.pre )
			.then( hooks.preFetch )
			.then( function( query ) {

				// Check all requested includes
				if( query.req.include.length > 0 ) {
					var include = query.req.include;
					for( var i in include ) {
						var inc = include[ i ];

						// If the included resources is unkown let the user know ...
						if( ! resource.reln[ inc ] && ! resource.rel1[ inc ] ) {
							return P.reject( new ModelsError(
								'unkown-relation',
								"Relation " + inc + " is unknown."
							) );
						}

						// If the included resource is based on a foreign key
						// make sure it is requested from datatbase
						if( resource.reln[ inc ] &&
						    query.req.fields[ name ] &&
						    query.req.fields[ name ].length &&
						    query.req.fields[ name ].indexOf( inc ) == -1 ) {
							query.req.fields[ name ].push( inc );
						}
					}
				}

				// Main request
				return resource.collection.fetch( {
					'selector': query.req.selector,
					'limit': query.req.limit,
					'page': query.req.page,
					'sort': query.req.sort,
					'fields': query.req.fields[ name ]
				} ).then( function( res ) {

					// Include result in response object
					query.res = {
						meta: { count: res.count, limit:res.limit, page: res.page }
					};
					query.res[ name ] = res.data;

				} ).then( function() {

					// Include related resources
					query.res.links = {};

					for( var rn in resource.reln ) {
						query.res.links[ rn ] = [ resource.reln[ rn ], '_id' ];
					}
					for( var r1 in resource.rel1 ) {
						query.res.links[ r1 ] = [ resource.rel1[ r1 ], r1 ];
					}

				} ).then( function() {

					// Include requested related resources
					query.res.linked = {};

					var queryStack = {};
					query.req.include.forEach( function( i ) {
						
						// Set values for queries
						var model, localField, remoteField;
						if( resource.reln[ i ] ) {
							model = resource.reln[ i ];
							localField = i;
							remoteField = '_id';
						} else if( resource.rel1[ i ] ) {
							model = resource.rel1[ i ];
							localField = '_id';
							remoteField = i;
						}

						// If model is unseen, create new query object
						if( ! queryStack[ model ] ) queryStack[ model ] = {
							fields: query.req.fields[ model ] || [],
							selectors: []
						};

						// Ref to fields
						var fields = queryStack[ model ].fields;
						var selectors = queryStack[ model ].selectors;

						// Make sure selected foreign key is included
						if( fields.length > 0 &&
						    fields.indexOf( remoteField ) == -1 ) {
							fields.push( remoteField );
						}

						// Go through all results from main query
						var ids = [];
						query.res[ name ].forEach( function( v ) {
							// If query does not contain th id, include it
							if( ids.indexOf( v[ localField ] ) == -1 ) ids.push( v[ localField ] );
						} );

						// Create and append query
						var tmp = {};
						tmp[ remoteField ] = { '$in': ids };
						selectors.push( tmp );

					} );

					// Create query jobs from query stack
					var includeJobs = [];
					function createJob( q, stack ) {
						includeJobs.push( resources[ q ].collection.fetch( {
							'selector': { '$or': stack.selectors },
							'fields': stack.fields
						} ).then( function( res ) {
							query.res.linked[ q ] = res.data;
						} ) );
					}
					for( var q in queryStack ) createJob( q, queryStack[ q ] );

					// Wait for all jobs
					return P.all( includeJobs );

				} ).return( query );
			} )
			.then( hooks.postFetch )
			.then( globalHooks.post );
	};

}; };
