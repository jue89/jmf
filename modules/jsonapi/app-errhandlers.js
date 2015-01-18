/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'app/errhandlers:jsonapi',
	inject: [ ],
};

module.exports.factory = function( BodyParser) { return {
	priority: -1, // Register last!
	register: function( app ) {

		// Catch all unhandled requests
		app.use( function( req, res, next ) {
			res.endJSONapiError( 404, 'not-found', "The requested item or method does not exist." );
		} );

		// Catch all unhandled errors
		app.use( function( err, req, res, next ) {
			res.endJSONapiError( 500, 'unknown-error', "Unkown error occured: " + err.message );
		} );

	}
}; };
