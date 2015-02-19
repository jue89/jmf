/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'models/factory',
	inject: [ 'require(bluebird)', 'models/factory:*' ]
};

module.exports.factory = function( P, factoryMethods ) {

	return function( models, resources, resource ) {
		
		var methods = {};
		for( var f in factoryMethods ) {

			// Extract method name
			var methodName = f.substring( f.indexOf( ':' ) + 1 );

			// Install proxy function
			methods[methodName] = factoryMethods[f]( models, resources, resource );
		}

		return methods;
	};

};

