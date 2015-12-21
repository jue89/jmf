/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'validator:type',
	inject: [ 'require(bluebird)', 'objhelper', 'schema/error']
};

module.exports.factory = function( P, oh, SchemaError, extPattern ) {

	return function( schema ) {
		var c = [];
		for( var s of schema.selectors ) {
			if( s.def.type === undefined )
				continue;

			c.push( {
				priority: 80,
				action: elem => s.select( elem, function( field ) {

					var type = oh.gettype( field );
					var expected = s.def.type;

					// TODO: date
					// other types are matched by patterns
					if( ['string', 'number', 'array', 'object', 'boolean'].indexOf( expected ) == -1 )
						expected = 'string';

					if( type != expected ) {
						return P.reject( new SchemaError(
							'wrong-type',
							"Field " + s.path + " has wrong type! " + expected + " expected."
						) );
					}

					return field;
				} )

			} );
		}

		return c;
	};
};
