/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'validator:mandatory',
	inject: [ 'require(bluebird)', 'schema/error' ]
};

module.exports.factory = function( P, SchemaError ) {
	return function( schema ) {
		var c = [];

		schema.selectors.forEach( function( s ) {

			if( !s.def.mandatory )
				return;

			c.push( {
				priority: 100,
				action: s.select( function( field ) {
					if( field === undefined ) {
						return P.reject( new SchemaError(
							'missing-field',
							'Field ' + s.path + ' is missing.'
						) );
					}

					return field;
				} )
			} );

		} );

		return c;
	};
};
