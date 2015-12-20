/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'schema',
	inject: [ 'require(bluebird)', 'require(util)', 'objhelper', 'schema/error', 'schema/pattern:*' ]
};

module.exports.factory = function( P, util, oh, SchemaError, extPattern ) {
};
