var fireup = require('fire-up').newInjector( {
	basePath: __dirname,
	modules: [
		'./config/*.js',
		'./hooks/*.js',
		'./modules/*/*.js'
	]
} )

fireup( 'app', { use: [  ] } )
