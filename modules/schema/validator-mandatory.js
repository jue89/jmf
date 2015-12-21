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
		for( var s of schema.selectors ) {
			if( !s.def.mandatory )
				continue;

			c.push( {
				priority: 100,
				action: elem => s.select( elem, function( field ) {
					if( field === undefined ) {
						return P.reject( new SchemaError(
							'missing-field',
							'Field ' + s.path + ' is missing.'
						) );
					}
					return field;
				} )
			} );
		}

		return c;
	};
};
