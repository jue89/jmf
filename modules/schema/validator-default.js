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
		for( var s of schema.selectors ) {
			if( s.def.default === undefined )
				continue;

			c.push( {
				priority: 90,
				action: elem => s.select( elem, function( field ) {
					if( field === undefined ) {
						return s.def.default;
					}
					return field;
				} )
			} );
		}

		return c;
	};
};
