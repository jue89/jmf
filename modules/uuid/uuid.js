/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'uuid',
	inject: [ 'require(uuid)' ],
};

module.exports.factory = function( uuid ) {
	return function( obj ) {
		obj.id = uuid.v4();

		return obj;
	};
};
