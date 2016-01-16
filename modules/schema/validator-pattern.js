/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'validator:pattern',
	inject: [ 'require(bluebird)', 'objhelper', 'schema/error', 'schema/pattern:*'  ]
};

module.exports.factory = function( P, oh, SchemaError, extPattern ) {

	// merge all external patterns in one object
	var patterns = {};
	for( var p in extPattern ) oh.append( patterns, extPattern[p] );

	return function( schema ) {
		var c = [];

		schema.selectors.forEach( function( s ) {
			if( s.def.pattern === undefined && !s.def.type && !( s.def.type in patterns ) )
				return;

			c.push( {
				priority: 50,
				action: s.select( function( field ) {
					// skip if it is not a string
					if( oh.gettype( field ) !== 'string' )
						return field;

					var expr;
					if( s.def.pattern !== undefined ) {
						expr = s.def.pattern;
					} else {
						expr = patterns[s.def.type];
					}

					if( ! (new RegExp(expr)).test( field ) ) {
						return P.reject( new SchemaError(
							'wrong-format',
							"Field " + s.path + " has wrong format!"
						) );
					}

					return field;
				} )

			} );
		} );

		return c;
	};
};
