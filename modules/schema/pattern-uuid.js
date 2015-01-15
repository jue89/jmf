// Fire me up!

module.exports = {
	implements: 'schema/pattern:uuid'
}

module.exports.factory = function() { return {
	'uuid-v4': '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
} }


