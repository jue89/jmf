/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'validator:undefined',
	inject: [ 'require(bluebird)', 'schema/error' ]
};

module.exports.factory = function( P, SchemaError ) {
	return function( schema ) {
		if( schema.ignoreUndefinedFields )
			return [];

		var definition = schema.def;
		function hasPath( p, implicit ) {
			for( var d in definition ) {
				if( implicit && d.slice( 0, p.length ) == p )
					return true;

				if( p == d )
					return true;
			}
			return false;
		}

		function walk( elem, head, dot ) {
			head = head || ''; dot = dot || '';

			if( !hasPath( head, true ) && head.slice( -2 ) !== '[]' ) {
				return P.reject( new SchemaError(
					'illegal-field',
					"Field " + head + " not allowed."
				) );
			}

			// passed hierarchy down to atomic element
			if( typeof elem !== 'object' ) return true;

			// check for a wildcard declaration
			if( hasPath( head, false ) &&
				definition[head].type === 'object' &&
				!( elem instanceof Array ) ) {
				// when a field type is defined as 'object', all subfields are allowed
				return true;
			}

			var newHead = f => head + ( elem instanceof Array ? '[]' : dot + f );

			// walk through all fields in elem
			return P.map( Object.keys(elem), f => walk( elem[f], newHead(f), '.' ) );
		}

		return [ {
			priority: 200,
			action:	function( elem ) {
				return walk( elem ).then( function () { return elem; } );
			}
		} ];
	};

};
