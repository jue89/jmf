/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'app/errhandlers:schema',
	inject: [ 'schema/error' ],
};

module.exports.factory = function( SchemaError ) { return {
	priority: 0,
	register: function( app ) {

		// Authorisation error
		app.use( function( err, req, res, next ) {
			if( ! (err instanceof SchemaError) ) return next( err );

			res.endJSONapiError( 400, err.type, err.message );
		} );
	}
}; };

