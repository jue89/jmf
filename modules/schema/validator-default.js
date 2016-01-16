/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'validator:default',
	inject: [ 'require(bluebird)', 'schema/error' ]
};

module.exports.factory = function( P, SchemaError ) {
	return function( schema ) {
		var c = [];

		schema.selectors.forEach( function( s ) {
			if( s.def.default === undefined )
				return;

			c.push( {
				priority: 90,
				action: s.select( function( field ) {
					if( field === undefined ) {
						return s.def.default;
					}
					return field;
				} )
			} );
		} );

		return c;
	};
};
