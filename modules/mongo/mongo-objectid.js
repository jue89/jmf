/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'mongo/objectid',
	inject: [ 'require(mongodb)' ]
};

module.exports.factory = function( Mongo ) {

	var ObjectID = Mongo.ObjectID;

	return function( obj ) {
		obj._id = new ObjectID().toString();

		return obj;
	}

};
