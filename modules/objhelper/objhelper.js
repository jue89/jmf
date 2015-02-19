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
			if( gettype(obj[o]) == "object" ) {
				append( ret, depack( obj[ o ], prefix + o + '.' ) );
			} else {
				ret[ prefix + o ] = obj[ o ];
			}
		}

		return ret;
	}

	// Pack objects
	function pack( obj ) {
		var ret = {};

		for( var o in obj ) {
			var path = o.split( '.' );
			var pointer = ret;
			for( var i = 0; i < path.length - 1; i++ ) {
				if( pointer[ path[i] ] === undefined ) pointer[ path[i] ] = {};
				pointer = pointer[ path[i] ];
			}
			pointer[ path[ i ] ] = obj[ o ];
		}

		return ret;
	}


}

