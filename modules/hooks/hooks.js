/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'hooks',
	inject: [ 'require(bluebird)', 'hook:*' ]
};

module.exports.factory = function( P, hooks ) {

	return getHooks;

	// Function to create Hooks
	function getHooks( module, actions ) {
		var ret = {};

		// Walk over all actions
		for( var a in actions ) {
			var action = actions[a];
			
			var funcs = [];
			for( var h in hooks ) {
				var hook = hooks[h];
				
				// Search for registered hooks
				if( hook[module] && hook[module][action] && hook[module][action].action ) {
					var i = hook[module][action];

					// Skip hooks without action
					if( ! i.action ) continue;

					// Add hook to stack
					funcs.push( {
						priority: i.priority ? i.priority : 0,
						action: P.method( i.action )
					} );
				}
			}

			// No hooks have been found -> Create dummy function
			if( funcs.length === 0 ) funcs.push( { action: P.method(
				function( args ) { return args; }
			) } );

			// Order functions by priority
			funcs.sort( function( a, b ) {
				if( a.priority < b.priority ) return 1;
				if( a.priority > b.priority ) return -1;
				return 0;
			} );

			// Save action
			ret[action] = seqPromises( funcs );

		}

		return ret;
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
