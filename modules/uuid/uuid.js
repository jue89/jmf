/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'uuid',
	inject: [ 'require(uuid)' ],
};

module.exports.factory = function( uuid ) {
	return function() {
		return uuid.v4();
	};
};
