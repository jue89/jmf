/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'models/factory:insert',
	inject: [ 'require(bluebird)', 'models/error', 'hooks', 'timestamps', 'schema' ]
};

module.exports.factory = function( P, ModelsError, getHooks, timestamps, schema ) { return function( models, resources, resource ) {

	var name = resource.name;

	// Obtain hooks
	var globalHooks = getHooks( 'global', [ 'pre', 'post' ] );
	var hooks = getHooks( name, [ 'preInsert', 'postInsert' ] );

	// Define add schema
	var testQuery = schema ( {
		'req': { type: 'object', default: {} }
	}, true );
	var testDoc = schema( resource.schema );

	// Returns the fetch function
	return function( query ) {
		if( typeof query != 'object' ) query = {};

		// Reference current models object
		query.self = models;

		// Things going to happen:
		// - Check query
		// - Call global hooks (global.pre)
		// - Generate id, if idGenerator is defined
		// - Add timestamps
		// - Call model.preInsert hooks
		// - Check against schema
		// - Check whether foreign items are existent
		// - Insert into database
		// - Call model.postInsert hooks
		// - Call global hooks (global.post)
		return testQuery( query )
			.then( globalHooks.pre )
			.then( function( query ) {
				// Generate and add _id field if generator is defined
				if( resource.idGenerator ) query.req._id = resource.idGenerator();

				// Add timestamps
				timestamps.add( query.req );

				return query;
			} )
			.then( hooks.preInsert )
			.then( function( query ) {
				// Test doc
				return testDoc( query.req ).return( query );
			})
			.then( function( query ) {
				// Check all foreign keys
				var checkJobs = [];
				for( var r in resource.reln ) {
					var fk = query.req[r];

					// Go through all foreign keys
					checkJobs.push( resources[ resource.reln[r] ].collection.fetch( {
						'selector': { '_id': fk }
					} ).then( function( res ) {
						if( res.count != 1 ) return P.reject( new ModelsError(
							'related-object-not-found',
							"Related object " + r + " not found."
						) );
						return P.resolve();
					} ) );

				}

				// Wait for all check jobs
				return P.all( checkJobs ).return( query );

			} )
			.then( function( query ) {
				// Inset into database
				return resource.collection.insert( query.req )
					.then( function( res ) { query.res = res; } )
					.return( query );
			} )
			.then( hooks.postInsert )
			.then( globalHooks.post );
	};

}; };

