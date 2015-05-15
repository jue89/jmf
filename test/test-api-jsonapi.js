var pki = require( '../pki/test_pki.js' );

var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/app/*.js',
		'./modules/jsonapi/*.js',
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
		{ implements: 'app/routes:jsonapi', factory: function() { return {
			register: function( app ) {
				app.get( '/simplelist', function( req, res ) {
					res.endJSON( { id: 1 } );
				} );

				app.get( '/simplelist/item', function( req, res ) {
					res.endJSONapiError( 400, 'test', "Test" );
				} );

			}
		}; } },
	]
} );
var request = require( 'request' ).defaults( { agentOptions: {
	ca: pki.ca,
	pfx: pki.client_pfx,
	passphrase: pki.client_pfx_password
} } );

var app;

describe( "API JSONAPI", function() {

	before( function( done ) {
		// Start API
		fireup( 'app' ).then( function( m ) {
			app = m;
			return done();
		} );
	} );

	it( "should return object", function( done ) {
		request.get( {
			url: 'https://localhost:8000/simplelist'
		}, function( err, res, body ) {
			body = JSON.parse( body );
			body.should.property('id');
			done( err );
		} );
	} );

	it( "should return api error", function( done ) {
		request.get( {
			url: 'https://localhost:8000/simplelist/item'
		}, function( err, res, body ) {
			body = JSON.parse( body );
			body.should.property('error');
			body.error.id.should.eql( 'test' );
			body.error.message.should.eql( "Test" );
			done();
		} );
	} );

	after( function( done ) {
		app.close();
		return done();
	} );
} );
