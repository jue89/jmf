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

		schema.selectors.forEach( function( s ) {
			if( s.def.type === undefined )
				return;

			c.push( {
				priority: 80,
				action: s.select( function( field ) {

					// we should not check types on undefined fields
					if( field === undefined ) return;

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
		} );

		return c;
	};
};
