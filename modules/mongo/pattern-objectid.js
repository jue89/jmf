/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'schema/pattern:objectid'
};

module.exports.factory = function() { return {
	'objectid': '^[0-9a-f]{24}$'
}; };


