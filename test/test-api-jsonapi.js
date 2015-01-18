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
			app: { user: null, group: null },
			https: {
				port: 8000,
				ca: pki.ca,
				key: pki.server_key,
				cert: pki.server_cert
			}
		}; } },
		{ implements: 'app/routes:jsonapi', factory: function() { return {
			register: function( app ) {
				app.get( '/simplelist', function( req, res ) {
					res.endJSONapiList( [ { id: 1 }, { id: 2 } ] );
				} );

				app.get( '/simplelist/item', function( req, res ) {
					res.endJSONapiItem( [ { id: 1 } ] );
				} );

				app.delete( '/simplelist/item', function( req, res ) {
					res.endJSONapiCheck( 1 );
				} );

				app.get( '/list', function( req, res ) {
					res.endJSONapiList( {
						data: [ { id: 1 }, { id: 2 } ],
						page: 1,
						limit: 2
					} );
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

	it( "should return unpaged list", function( done ) {
		request.get( {
			url: 'https://localhost:8000/simplelist'
		}, function( err, res, body ) {
			body = JSON.parse( body );
			body.should.properties('meta', 'simplelist');
			body.meta.count.should.eql( 2 );
			body.simplelist.should.eql( [{id:1},{id:2}] );
			done( err );
		} );
	} );

	it( "should return paged list", function( done ) {
		request.get( {
			url: 'https://localhost:8000/list'
		}, function( err, res, body ) {
			body = JSON.parse( body );
			body.should.properties('meta', 'list');
			body.meta.count.should.eql( 2 );
			body.meta.limit.should.eql( 2 );
			body.meta.page.should.eql( 1 );
			body.list.should.eql( [{id:1},{id:2}] );
			done( err );
		} );
	} );

	it( "should return item", function( done ) {
		request.get( {
			url: 'https://localhost:8000/simplelist/item'
		}, function( err, res, body ) {
			body = JSON.parse( body );
			body.should.properties('simplelist');
			body.simplelist.should.eql( {id:1} );
			done( err );
		} );
	} );

	it( "should return ok status", function( done ) {
		request.del( {
			url: 'https://localhost:8000/simplelist/item'
		}, function( err, res, body ) {
			res.statusCode.should.eql( 200 );
			done( err );
		} );
	} );

	it( "should return not found status", function( done ) {
		request.get( {
			url: 'https://localhost:8000/simplelist/item2'
		}, function( err, res, body ) {
			res.statusCode.should.eql( 404 );
			done( err );
		} );
	} );

	after( function( done ) {
		app.close();
		return done();
	} );
} );
