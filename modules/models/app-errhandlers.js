/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'httpd/errhandlers:models',
	inject: [ 'models/error' ],
};

module.exports.factory = function( ModelsError ) { return {
	priority: 0,
	register: function( app ) {

		// Authorisation error
		app.use( function( err, req, res, next ) {
			if( ! (err instanceof ModelsError) ) return next( err );

			var code;
			switch( err.type ) {
				case 'unkown-relation':
					code = 400;
					break;
				case 'related-object-not-found':
				case 'depending-related-object':
					code = 409; // Conflict
					break;
				case 'drop-fail':
					code = 500; // Internal Server Error
					break;
                                case 'action-prohibited':
                                        // TODO: rfc2616 - 14.7 Allow
                                        code = 405;
                                        break;
				default:
					code = 400;
			}

			res.endJSONapiError( code, err.type, err.message );
		} );
	}
}; };
