/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'validator:minmax',
	inject: [ 'require(bluebird)', 'objhelper', 'schema/error' ]
};

module.exports.factory = function( P, oh, SchemaError ) {
	return function( schema ) {
		var c = [];

		schema.selectors.forEach( function( s ) {
			var min = s.def.min;
			var max = s.def.max;

			if( !min && !max )
				return;

			c.push( {
				priority: 80,
				action: s.select( function( field ) {
					var type = oh.gettype( field );
					var val;

					// select val to compare
					switch( type ) {
					case 'string':
					case 'array':
						val = field.length; break;
					case 'number':
						val = field; break;
					default:
						// skip comparisons if the type is not usable
						return field;
					}

					if( min && val < min ) {
						if( type == 'array' || type == 'string' ) {
							return P.reject( new SchemaError(
								'min-length-dropped-below',
								"Field " + s.path + " is too short!"
							) );
						} else {
							return P.reject( new SchemaError(
							    'min-value-dropped-below',
							    "Field " + field.selector + " is too small!"
							) );}
					}

					if( max && val > max ) {
						if( type == 'array' || type == 'string' ) {
							return P.reject( new SchemaError(
							    'max-length-exceeded',
							    "Field " + field.selector + " is too long!"
							) );
						} else {
							return P.reject( new SchemaError(
								'max-value-exceeded',
								"Field " + s.path + " is too large!"
							) );
						}
					}

					return field;
				} )
			} );
		} );

		return c;
	};
};
