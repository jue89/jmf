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
		'./modules/jsonapi/*.js',
		'./modules/schema/*.js',
		{ implements: 'config', factory: function() { return {
			app: { user: null, group: null },
			https: {
				port: 8000,
				ca: ca,
				key: server_key,
				cert: server_cert
			}
		}; } },
		{ implements: 'app/routes:schema', inject: ['schema'], factory: function(schema) { return {
			register: function( app ) {
				var test = schema( { 'id': { mandatory: true, type: 'number' } } );
				app.post( '/schema', function( req, res, next ) {
					test( req.body ).then( function( obj ) {
						res.endJSONapiItem( [ obj ] );
					} ).catch( next );
				} );
			}
		}; } },
	]
} );
var request = require( 'request' ).defaults( { agentOptions: {
	ca: ca,
	pfx: client_pfx,
	passphrase: '1234567890',
	rejectUnauthorized: false
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
			headers: { 'Content-Type': 'application/vnd.api+json' },
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
			headers: { 'Content-Type': 'application/vnd.api+json' },
			body: JSON.stringify( { id: 1 } )
		}, function( err, res, body ) {
			body = JSON.parse( body );
			res.statusCode.should.eql( 200 );
			body.should.property( 'schema' );
			body.schema.id.should.eql( 1 );
			done( err );
		} );
	} );

	after( function( done ) {
		app.close();
		return done();
	} );
} );
