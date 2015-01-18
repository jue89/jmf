var pki = require( './pki.json' );
var ca = new Buffer( pki.ca, 'base64' );
var server_key = new Buffer( pki.server_key, 'base64' );
var server_cert = new Buffer( pki.server_cert, 'base64' );
var client_pfx = new Buffer( pki.client_pfx, 'base64' );

var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/app/*.js',
		{ implements: 'config', factory: function() { return {
			app: { user: null, group: null },
			https: {
				port: 8000,
				ca: ca,
				key: server_key,
				cert: server_cert
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
	ca: ca,
	pfx: client_pfx,
	passphrase: '1234567890',
	rejectUnauthorized: false
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
