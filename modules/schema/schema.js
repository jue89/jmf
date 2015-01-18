/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'schema',
	inject: [ 'require(bluebird)', 'require(util)', 'schema/error', 'schema/pattern:*' ]
};

module.exports.factory = function( P, util, SchemaError, extPattern ) {

	// More adequate method for determining type
	function gettype( obj ) {

		if( obj === null ) return 'null';

		if( typeof obj == 'object' ) {
			if( obj instanceof Array ) return 'array';
			if( obj instanceof Date ) return 'date';
			if( obj instanceof RegExp ) return 'regexp';
		}

		return typeof obj;
	}
	
	// Append object to another
	function append( dst, src ) {
		for( var i in src ) {
			dst[i] = src[i];
		}
	}

	// Depack nested objects
	function depack( obj, prefix ) {
		if( ! prefix ) prefix = "";

		var ret = {};

		for( var o in obj ) {
			if( gettype(obj[o]) == "object" ) {
				append( ret, depack( obj[ o ], prefix + o + '.' ) );
			} else {
				ret[ prefix + o ] = obj[ o ];
			}
		}

		return ret;
	}


	// Prepare external pattern
	var pattern = {};
	for( var p in extPattern ) append( pattern, extPattern[p] );


	// Factory 
	return function( schema ) {

		// Resolve external patterns
		for( var s in schema ) {
			if( pattern[ schema[s].type ] ) {
				schema[s].pattern = pattern[ schema[s].type ];
				schema[s].type = 'string';
			}
		}

		// Return check function (with fancy promises)
		return function( obj ) { return new P( function( resolve, reject ) {

			var test = depack( obj );

			// Check for missing fields that are mandatory
			for( var i in schema ) {
				if( schema[i].mandatory && ! test[i] ) return reject( new SchemaError(
					'missing-field',
					"Field " + i + " is missing."
				) );
			}
			
			// Check for undefined or check pattern
			for( i in test ) {
				// Check whether field is defined in schema
				if( ! schema[i] ) return reject( new SchemaError(
					'illegal-field',
					"Field " + i + " not allowed."
				) );

				var type = gettype( test[i] );

				// Check for right data type
				if( schema[i].type && type != schema[i].type ) {
					return reject( new SchemaError(
						'wrong-type',
						"Field " + i + " has wrong type! " + schema[i].type + " expected."
					) );
				}

				// Check for length
				if( type == 'string' && schema[i].minLength ) {
					if( test[i].length < schema[i].minLength ) {
						return reject( new SchemaError(
							'min-length-dropped-below',
							"Field " + i + " is too short!"
						) );
					}
				}
				if( type == 'string' && schema[i].maxLength ) {
					if( test[i].length > schema[i].maxLength ) {
						return reject( new SchemaError(
							'max-length-exceeded',
							"Field " + i + " is too long!"
						) );
					}
				}

				// Check for pattern
				if( type == 'string' && schema[i].pattern ) {
					if( gettype( schema[i].pattern ) == "string" ) {
						schema[i].pattern = new RegExp( schema[i].pattern );
					}
					
					if( ! schema[i].pattern.test( test[i] ) ) {
						return reject( new SchemaError(
							'wrong-format',
							"Field " + i + " has wrong format!"
						) );
					}
				}
			}

			return resolve( obj );
			
		} ); };
	};
};
