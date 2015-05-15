var pki = require( '../pki/test_pki.js' );

var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/app/*.js',
		{ implements: 'config', factory: function() { return {
			listen: { port: 8000, host : '::' },
			https: {
				ca: pki.ca,
				key: pki.server_key,
				cert: pki.server_cert,
				requestCert: true,
				rejectUnauthorized: true
			}
		}; } },
		{ implements: 'app/routes:r1', factory: function() { return {
			priority: 0,
			register: function( app ) {
				app.get( '/', function( req, res ) {
					res.end( "r1" );
				} );
			}
		}; } },
		{ implements: 'app/routes:r2', factory: function() { return {
			priority: 1,
			register: function( app ) {
				app.get( '/', function( req, res ) {
					res.end( "r2" );
				} );
			}
		}; } },
		{ implements: 'app/drivers:d', factory: function() { return {
			priority: 0,
			register: function( app ) {
				app.use( function( req, res, next ) {
					req.test = "not-found";
					next();
				} );
			}
		}; } },
		{ implements: 'app/errhandlers:e', factory: function() { return {
			priority: 0,
			register: function( app ) {
				app.use( function( req, res ) {
					res.end( req.test );
				} );
			}
		}; } }
	]
} );
var request = require( 'request' ).defaults( { agentOptions: {
	ca: pki.ca,
	pfx: pki.client_pfx,
	passphrase: pki.client_pfx_password
} } );

var app;

describe( "API app", function() {

	before( function( done ) {
		// Start API
		fireup( 'app' ).then( function( m ) {
			app = m;
			return done();
		} );
	} );

	it( "should prioritise routes with high priority", function( done ) {
		request.get( {
			url: 'https://localhost:8000/'
		}, function( err, res, body ) {
			body.should.eql( "r2" );
			done( err );
		} );
	} );

	it( "should return error handler's body generated from driver", function( done ) {
		request.get( {
			url: 'https://localhost:8000/notfound'
		}, function( err, res, body ) {
			body.should.eql( "not-found" );
			done( err );
		} );
	} );

	after( function( done ) {
		app.close();
		return done();
	} );
} );
