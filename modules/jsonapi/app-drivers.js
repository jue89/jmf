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

			return next();
		} );

		// Parse all JSON data
		app.use( BodyParser.json( ) );
	}
}; };
