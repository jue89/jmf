/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'objhelper',
	inject: []
};

module.exports.factory = function() {

	return {
		gettype: gettype,
		pack: pack,
		depack: depack,
		append: append
	};

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

			// Get the type of the current obeject
			var type = gettype( obj[o] );

			if( type == "object" ) {

				// Objects are depacked recursively
				append( ret, depack( obj[ o ], prefix + o + '.' ) );

			} else if( type == "array" ) {

				// Iterate over the array and depack contained objects
				for( var a in obj[ o ] ) {

					if( gettype( obj[ o ][ a ] ) == 'object' ) {

						// If it contains an object, depack it
						append( ret, depack( obj[ o ][ a ], prefix + o + '[' + a + '].' ) );

					} else {

						// Simply append array item to flattened object
						ret[ prefix + o + '[' + a + ']' ] = obj[ o ][ a ];

					}

				}

			} else {

				// Otherwise copy the item to flattened object
				ret[ prefix + o ] = obj[ o ];

			}
		}

		return ret;
	}

	// Pack objects
	function pack( obj ) {
		var ret = {};

		// Regular expression for testing names againts array name pattern
		var arrayPattern = /^([^\[]*)\[([0-9]+)\]$/;

		// Some helper function
		var name, test, arrayName, arrayItem;

		// Walk through flattned object
		for( var o in obj ) {

			// Walk through the path
			var path = o.split( '.' );
			var pointer = ret;
			for( var i = 0; i < path.length - 1; i++ ) {

				name = path[i];
				test = arrayPattern.exec( name );

				if( test !== null ) {

					// Field name is an array name
					arrayName = test[1];
					arrayItem = test[2];

					// Create array if it does not exist
					if( pointer[ arrayName ] === undefined ) pointer[ arrayName ] = [];

					// Create object if it does not exist
					if( pointer[ arrayName ][ arrayItem ] === undefined ) pointer[ arrayName ][ arrayItem ] = {};

					// Set pointer to array item
					pointer = pointer[ arrayName ][ arrayItem ];

				} else {

					// Field name is an object
					if( pointer[ path[i] ] === undefined ) pointer[ path[i] ] = {};
					pointer = pointer[ path[i] ];

				}

			}

			// At the end of the path finally append the object
			name = path[ i ];
			test = arrayPattern.exec( name );
			if( test !== null ) {

				// It's an array ...
				arrayName = test[1];
				arrayItem = test[2];

				// Create array if it does not exist
				if( pointer[ arrayName ] === undefined ) pointer[ arrayName ] = [];

				// Assing object to array
				pointer[ arrayName ][ arrayItem ] = obj[ o ];

			} else {

				// Just assing the object
				pointer[ path[ i ] ] = obj[ o ];

			}
		}

		return ret;
	}

};
