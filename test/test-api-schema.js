var pki = require( '../pki/test_pki.js' );

var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/app/*.js',
		'./modules/jsonapi/*.js',
		'./modules/schema/*.js',
		'./modules/objhelper/*.js',
		{ implements: 'config', factory: function() { return {
			app: { user: null, group: null },
			https: {
				port: 8000,
				ca: pki.ca,
				key: pki.server_key,
				cert: pki.server_cert
			}
		}; } },
		{ implements: 'app/routes:schema', inject: ['schema'], factory: function(schema) { return {
			register: function( app ) {
				var test = schema( { 'id': { mandatory: true, type: 'number' } } );
				app.post( '/schema', function( req, res, next ) {
					test( req.body ).then( function( obj ) {
						res.endJSON( obj );
					} ).catch( next );
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
describe( "API schema", function() {

	before( function( done ) {
		// Start API
		fireup( 'app' ).then( function( m ) {
			app = m;
			return done();
		} );
	} );

	it( "should reject schema mismatch", function( done ) {
		request.post( {
			url: 'https://localhost:8000/schema',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { id: 'test' } )
		}, function( err, res, body ) {
			body = JSON.parse( body );
			res.statusCode.should.eql( 400 );
			body.should.property( 'error' );
			body.error.id.should.eql( 'wrong-type' );
			done( err );
		} );
	} );

	it( "should accept schema match", function( done ) {
		request.post( {
			url: 'https://localhost:8000/schema',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { id: 1 } )
		}, function( err, res, body ) {
			body = JSON.parse( body );
			res.statusCode.should.eql( 200 );
			body.should.property( 'id' );
			body.id.should.eql( 1 );
			done( err );
		} );
	} );

	after( function( done ) {
		app.close();
		return done();
	} );
} );
