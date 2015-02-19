/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'models/factory:drop',
	inject: [ 'require(bluebird)', 'models/error', 'hooks', 'schema' ]
};

module.exports.factory = function( P, ModelsError, getHooks, schema ) { return function( models, resources, resource ) {

	var name = resource.name;

	// Obtain hooks
	var globalHooks = getHooks( 'global', [ 'pre', 'post' ] );
	var hooks = getHooks( name, [ 'preDrop', 'postDrop' ] );

	// Define update schemas
	var testQuery = schema ( {
		'req': { type: 'object', default: {} },
	}, true );

	// Returns the fetch function
	return function( query ) {
		if( typeof query != 'object' ) query = {};

		// Reference current models object
		query.self = models;

		// Things going to happen:
		// - Check query
		// - Call global hooks (global.pre)
		// - Call model.preDrop hooks
		// - Get all items that are affected
		// - Check whether foreign items depending on these items
		// - Drop da base!
		// - Call model.postDrop hooks
		// - Call global hooks (global.post)
		return testQuery( query )
			.then( globalHooks.pre )
			.then( hooks.preDrop )
			.then( function( query ) {

				// Get all affected objects
				return resource.collection.fetch( {
					'selector': query.req.selector
				} ).then( function( res ) {
					query.res = res.data;
				} ).return( query );

			} )
			.then( function( query ) {

				// Collect all IDs
				var ids = [];
				query.res.forEach( function( item ) {
					ids.push( item._id );
				} );

				// Check all related collections
				var checkJobs = [];
				for( var r in resource.rel1 ) {

					// Go through all collections
					var tmp = {};
					tmp[ r ] = { '$in': ids };
					checkJobs.push( resources[ resource.rel1[ r ] ].collection.fetch( {
						'selector': tmp
					} ).then( function( res ) {
						if( res.count === 0 ) return P.resolve();

						var ids = [];
						res.data.forEach( function( id ) {
							ids.push( id );
						} );

						return P.reject( new ModelsError(
							'depending-related-object',
							"Object " + ids.join( ", " ) + " are related to these objects."
						) );
					} ) );

				}

				// Wait for all check jobs
				return P.all( checkJobs ).return( query );

			} )
			.then( function( query ) {

				// Collect all IDs
				var ids = [];
				query.res.forEach( function( item ) {
					ids.push( item._id );
				} );

				// And drop from database
				return resource.collection.drop( {
					'selector': { '_id': { '$in': ids } }
				} ).then( function( res ) {
					if( res != query.res.length) return P.reject( new ModelsError(
						'drop-fail',
						"Not all items have been dropped. I have no idea why?! Chuck Norris might be able to help you."
					) );
				} ).return( query );

			} )
			.then( hooks.postDrop )
			.then( globalHooks.post );
	};

}; };

