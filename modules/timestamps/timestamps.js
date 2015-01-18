/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'timestamps',
	inject: [],
};

module.exports.factory = function() {

	return {
		add: add,
		update: update
	};

	// Set timestamps for record creation
	function add( obj ) {
		obj.created_at = new Date();

		return obj;
	}

	// Set timestamps for record update
	function update( obj ) {
		obj.updated_at = new Date();

		return obj;
	}
};

