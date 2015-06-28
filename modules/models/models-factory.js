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

	return function( resources, resource ) {

		var model = {};

		// Add functions
		for( var f in factoryMethods ) {

			// Extract method name
			var methodName = f.substring( f.indexOf( ':' ) + 1 );

			if( ! ( resource.reject instanceof Array ) ||
			    resource.reject.indexOf( methodName ) == -1 ) {
				// Install proxy function
				model[methodName] = factoryMethods[f]( resources, resource );
			} else {
				// Install reject function
				model[methodName] = reject;
			}
		}

		// Add information to model
		model.name = resource.name;
		model.schema = resource.schema;
		model.index = resource.index;
		model.hidden = resource.hidden;

		return model;
	};

};
