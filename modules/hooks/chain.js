/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'chain',
	inject: [ 'require(bluebird)' ]
};

module.exports.factory = function( P ) {

	return getChain;

	function getChain( funcs ) {

		var promises = funcs.map( function( f ) {
			return {
				// default priority is 0
				priority: f.priority ? f.priority : 0,

				// wrap actions with a promise if nessecary
				action: P.method( f.action )
			};
		} );

		// No funcs have been found -> Create dummy function
		if( promises.length === 0 ) {
			promises.push( {
				priority: 0,
				action: P.method( function( args ) { return args; } )
			} );
		}

		// Order functions by priority
		promises.sort( function( a, b ) {
			if( a.priority < b.priority ) return 1;
			if( a.priority > b.priority ) return -1;
			return 0;
		} );

		return seqPromises( promises );
	}

	// Hepler function to sequence promises
	function seqPromises( promises ) {
		return function( args ) {
			var i = 0;
			var p = promises[i++].action( args );
			// Cascade all hooks
			while( i < promises.length ) {
				p = p.then( promises[i++].action );
			}
			return p;
		};
	}

};
