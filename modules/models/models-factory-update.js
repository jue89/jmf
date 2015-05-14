/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'models/factory:update',
	inject: [ 'require(bluebird)', 'models/error', 'hooks', 'timestamps', 'schema' ]
};

module.exports.factory = function( P, ModelsError, getHooks, timestamps, schema ) { return function( resources, resource ) {

	var name = resource.name;

	// Obtain hooks
	var globalHooks = getHooks( 'global', [ 'pre', 'post' ] );
	var hooks = getHooks( name, [ 'preUpdate', 'postUpdate' ] );

	// Define update schemas
	var testQuery = schema ( {
		'req.modifier.$set': { type: 'object', default: {} },
		'req.selector': { type: 'object', default: {} },
	}, true );
	var updateSchema = {};
	for( var s in resource.schema ) {
		// Don't allow any modifications to _id
		if( s == '_id' ) continue;

		// Wipe out mandatory and default fields
		updateSchema[s] = {
			type: resource.schema[s].type,
			pattern: resource.schema[s].pattern,
			min: resource.schema[s].min,
			max: resource.schema[s].max
		};
	}
	var testDoc = schema( updateSchema );

	// Returns the fetch function
	return function( query ) {
		if( typeof query != 'object' ) query = {};

		// Refernce to the current model and action (e.g. for global hooks)
		query.action = 'update';
		query.model = name;

		// Things going to happen:
		// - Check query
		// - Call global hooks (global.pre)
		// - Add timestamps
		// - Call model.preUpdate hooks
		// - Check against schema
		// - Check whether foreign items are existent
		// - Update database
		// - Call model.postUpdate hooks
		// - Call global hooks (global.post)
		return testQuery( query )
			.then( globalHooks.pre )
			.then( function( query ) {
				// Add timestamp
				timestamps.update( query.req.modifier.$set );

				return query;
			} )
			.then( hooks.preUpdate )
			.then( function( query ) {
				// Check $set modifier
				return testDoc( query.req.modifier.$set ).return( query );
			} )
			.then( function( query ) {
				// Check all foreign keys
				var checkJobs = [];
				for( var r in resource.reln ) {
					var fk = query.req.modifier.$set[r];

					// Not in $set object? -> skip
					if( ! fk ) continue;

					// n-m relations are presented in arrays
					if( ! (fk instanceof Array) ) fk = [ fk ];

					// Go through all foreign keys
					for( var i = 0; i < fk.length; i++ ) {
						checkJobs.push( resources[ resource.reln[r] ].collection.fetch( {
							'selector': { '_id': fk[i] }
						} ).then( function( res ) {
							if( res.count != 1 ) return P.reject( new ModelsError(
								'related-object-not-found',
								"Related object " + r + " not found."
							) );
							return P.resolve();
						} ) );
					}
				}

				// Wait for all check jobs
				return P.all( checkJobs ).return( query );

			} )
			.then( function( query ) {
				// Apply modifications
				return resource.collection.update( query.req )
					.then( function( res ) { query.res = res; } )
					.return( query );
			} )
			.then( hooks.postUpdate )
			.then( globalHooks.post );
	};

}; };
