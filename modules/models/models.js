/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'models',
	inject: [ 'require(bluebird)', 'models/factory', 'model:*', 'mongo' ]
};

module.exports.factory = function( P, methodFactory, resourceDefs, mongo ) {
	
	// Get resources
	var resource;
	var resources = {};
	var availableResources = [];
	for( var r in resourceDefs ) {
		resource = resourceDefs[r];
		
		// Fill required fields if not defined
		if( ! resource.name ) resource.name = r.substring( r.indexOf( ':' ) + 1 );
		if( ! resource.collection ) resource.collection = mongo.collection( resource.name );

		// Prepare needed field
		resource.reln = {};
		resource.rel1 = {};

		// Save resources
		resources[ resource.name ] = resource;
		availableResources.push( resource.name );
	}

	// Resolve relations
	for( r in resources ) {
		resource = resources[r];

		// Find foreign keys
		for( var s in resource.schema ) {
			if( typeof resource.schema[s] == 'string' ) {
				var foreign = resource.schema[s];
				
				// Save links
				resource.reln[ s ] = foreign;
				resources[ foreign ].rel1[ s ] = resource.name;
				
				// Overwirte schema
				resource.schema[s] = resources[ foreign ].schema._id;
			}
		}

		// Add fields for timestamps
		resource.schema.created_at = { type: 'date' };
		resource.schema.updated_at = { type: 'date' };
	}

	// Create indices
	var indexJobs = [];
	for( r in resources ) {
		resource = resources[r];

		// Iterate through definitions
		if( resource.index instanceof Array ) resource.index.forEach( function( i ) {
			if( typeof i == 'string' ) i = [ i ];
			indexJobs.push( resource.collection.index( i[ 0 ], i[ 1 ] ) );
		} );
		
	}

	// Prepare models object
	var models = {};
	for( r in resources ) {
		models[r] = methodFactory( models, resources, resources[r] );
	}
	models._index = availableResources;

	// Wait for index creation to finish and then return models object
	return P.all( indexJobs ).return( models );

};
