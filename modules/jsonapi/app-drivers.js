/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'app/drivers:jsonapi',
	inject: [ 'require(body-parser)' ],
};

module.exports.factory = function( BodyParser) { return {
	priority: 1, // Register first!
	register: function( app ) {

		// Parse all JSON data
		app.use( BodyParser.json( { type: 'application/*+json' } ) );

		// Install helper functions
		var endpointRE = /^\/(\w*)/;
		app.use( function( req, res, next ) {

			// General JSON return function.
			res.endJSON = function( obj ) {
				// Query parameter 'pretty' will format the output to be more readable
				var pretty = (this.req.query.pretty !== null) ? '  ' : null;
				
				// Pretty outputs has not Content-Type. Otherwise they wouldn't be displayed in the browser
				if( ! pretty ) this.type('application/vnd.api+json');

				return this.end( JSON.stringify( obj, null, pretty ) );
			};

			// JSONAPI: Error
			res.endJSONapiError = function( status, id, message ) {
				this.status( status );

				return this.endJSON( { error: {
					id: id,
					message: message
				} } );
			};

			// JSONAPI: List items
			res.endJSONapiList = function( obj ) {
				var ret = {};
				var endpoint = endpointRE.exec( req.originalUrl )[1];

				if( obj instanceof Array ) {
					// Simple array -> no pagination
					ret.meta = { count: obj.length };
					ret[ endpoint ] = obj;
				} else if( obj.data ) {
					// Object with data field -> pagination
					ret.meta = {
						count: obj.count ? obj.count : obj.data.length,
						page: obj.page ? obj.page : 0,
						limit: obj.limit ? obj.limit: 0
					};
					ret[ endpoint ] = obj.data;
				}
				
				return this.endJSON( ret );
			};

			// JSONAPI: Return single item
			res.endJSONapiItem = function( obj ) {
				// No single item is given -> Not found
				if( obj.length != 1 ) return this.endJSONapiError( 404, 'not-found', "The requested item does not exist." );
				
				// Create return object
				var ret = {};
				var endpoint = endpointRE.exec( req.originalUrl )[1];
				ret[ endpoint ] = obj[0];

				return this.endJSON( ret );
			};

			// JSONAPI: Returns just whether ok is true
			res.endJSONapiCheck = function( ok ) {
				if( ! ok ) return this.endJSONapiError( 404, 'not-found', "The requested item does not exist." );
				
				return this.status( 200 ).end();
			};

			return next();
		} );
	}
}; };
