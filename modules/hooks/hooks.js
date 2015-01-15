// Fire me up!

module.exports = {
	implements: 'hooks',
	inject: [ 'require(bluebird)', 'hook:*' ],
	type: 'multiple instances'
}

module.exports.factory = function( P, hooks, module, actions ) {
	// Convert required actions to an array
	actions = actions.split( ' ' );

	var ret = {};

	// Walk over all actions
	for( var a in actions ) {
		var action = actions[a]
		
		var funcs = [];
		for( var h in hooks ) {
			var hook = hooks[h]
			
			// Search for registered hooks
			if( hook[module] && hook[module][action] && hook[module][action].action ) {
				var h = hook[module][action];

				// Skip hooks without action
				if( ! h.action ) continue;

				// Add hook to stack
				funcs.push( {
					priority: h.priority ? h.priority : 0,
					action: P.method( h.action )
				} );
			}
		}

		// No hooks have been found -> Create dummy function
		if( funcs.length == 0 ) funcs.push( { action: P.method(
			function( args ) { return args; }
		) } );

		// Order functions by priority
		funcs.sort( function( a, b ) {
			if( a.priority < b.priority ) return 1;
			if( a.priority > b.priority ) return -1;
			return 0;
		} );

		// Save action
		ret[action] = ( function( f ){ return function( args ) {
			var p, i = 0;
			var p = f[i++].action( args );
			// Cascade all hooks
			while( i < f.length ) {
				p = p.then( f[i++].action );
			}
			return p;
		} } )( funcs )

	}

	return ret;
}

