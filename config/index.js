// Fire me up!

module.exports = {
	implements: 'config',
	inject: [ 'config:default' ]
}

// Wrapper for default config
module.exports.factory = function( defaultConfig ) {
	return defaultConfig;
}
