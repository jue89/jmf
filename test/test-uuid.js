var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/uuid/*.js'
	]
} );

var uuid;
describe( "Module uuid", function() {
	before( function( done ) {
		// Fetch Schema Module
		fireup( 'uuid' ).then( function( m ) {
			uuid = m;
			done();
		} );
	} );

	it( "should add ID field with UUID to an object", function( done ) {
		var obj = { name: 'test' };

		obj = uuid( obj );

		obj.id.should.match( /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/ )

		done();
	} );
} );
