/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'schema',
	inject: [ 'require(bluebird)', 'chain', 'validator:*' ]
};

module.exports.factory = function( P, chain, validators ) {

	return function( schema, ignoreUndefinedFields ) {

		function generateSelector( path ) {
			function select( fun ) {
				var walk = function( tail ) { return function( item ) {
					// execute fun, if you are at a leaf
					if( tail.length === 0 ) {
						return P.method( fun )( item );
					}

					var newTail = tail.slice(1);
					var walkDeeper = walk( newTail );
					var head = tail[0];

					var promise = null;
					if( head.slice( -2 ) === '[]' ) {
						// remove '[]' at the end of head
						var h = head.slice( 0, -2 );

						if( !( item[h] instanceof Array ) )
							return item;

						promise = P.map( item[h], walkDeeper );
					} else if( item ) {
						promise = walkDeeper( item[head] );
					} else {
						promise = walkDeeper( undefined );
					}

					// write back the results
					promise = promise.then( function( res ) {
						// create the item if needed
						if( res !== undefined ) {
							if( item === undefined ) item = {};

							item[head] = res;
						}

						// delete the result from item if necessary
						if( res === undefined ) {
							delete item[head];
						}

						return item;
					} );

					return promise;
				}; };

				return walk( path.split('.') );
			}

			return {
				path: path,
				def: schema[path],
				select: select
			};

		}

		var s = {
			def: schema,
			selectors: Object.keys( schema ).map( generateSelector ),
			ignoreUndefinedFields: ignoreUndefinedFields
		};

		var c = [];

		for( var v in validators ) {
			var validator = validators[v];
			c = c.concat( validator(s) );
		}

		return chain( c );
	};
};
