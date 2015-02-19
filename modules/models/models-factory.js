/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'models/factory',
	inject: [ 'require(bluebird)', 'models/error', 'models/factory:*' ]
};

module.exports.factory = function( P, ModelsError, factoryMethods ) {

	function reject() {
		return P.reject( new ModelsError(
			'action-prohibited',
			"This action is prohibited due to model constraints."
		) );
	}

	return function( models, resources, resource ) {
		
		var methods = {};
		for( var f in factoryMethods ) {

			// Extract method name
			var methodName = f.substring( f.indexOf( ':' ) + 1 );

			if( ! ( resource.reject instanceof Array ) ||
			    resource.reject.indexOf( methodName ) == -1 ) {
				// Install proxy function
				methods[methodName] = factoryMethods[f]( models, resources, resource );
			} else {
				// Install reject function
				methods[methodName] = reject;
			}
		}

		return methods;
	};

};

