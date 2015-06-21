/* jslint node: true */
'use strict';

var fireup = require('fire-up').newInjector( {
	basePath: __dirname,
	modules: [
		'./config/*.js',
		'./modules/*/*.js',
		'./app/*/*.js'
	]
} );

// Override injected modules
var override = [];

// Get config
if( process.env.CONFIG ) override.push( "config:" + process.env.CONFIG );

// And here we go !
fireup( 'app', { use: override } );
