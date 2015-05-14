/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'app/errhandlers:mongo',
	inject: [],
};

module.exports.factory = function() { return {
	priority: 0,
	register: function( app ) {

		// MongoDB error
		app.use( function( err, req, res, next ) {
			if( err.name !== 'MongoError' ) return next( err );

			var code = 400;
			var type = 'db-unkown';
			var message = "Unkown database error: " + err.message;

			switch( err.code ) {
				case 11000:
					code = 409;
					type = 'db-duplicate-key';
					message = "Cannot create entry due to duplicate information.";
					break;
				case 11001:
					code = 409;
					type = 'db-duplicate-key';
					message = "Cannot update entry due to duplicate information.";
					break;
			}

			res.endJSONapiError( code, type, message );
		} );
	}
}; };
