/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'hooks',
	inject: [ 'require(bluebird)', 'chain', 'hook:*' ]
};

module.exports.factory = function( P, chain, hooks ) {

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
					funcs.push(i);
				}
			}

			// chain the functions and save the action
			ret[action] = chain( funcs );

		}

		return ret;
	}

};
