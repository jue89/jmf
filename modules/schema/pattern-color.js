// Fire me up!

module.exports = {
	implements: 'schema/pattern:color'
}

module.exports.factory = function() { return {
	'color': '^#[0-9a-f]{6}$'
} }

