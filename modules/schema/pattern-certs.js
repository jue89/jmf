/* jslint node: true */
'use strict';
// Fire me up!

module.exports = {
	implements: 'schema/pattern:certs'
};

module.exports.factory = function() { return {
	'fingerprint-sha1': '^([0-9a-f]{2}:){19}[0-9a-f]{2}$'
}; };


