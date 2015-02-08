/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo',
	inject: [ 'require(mongodb-promises)', 'config' ],
};

module.exports.factory = function( Mongo, config ) {
	return Mongo.db( config.mongodb.host, config.mongodb.db );
};
