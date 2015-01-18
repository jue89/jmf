var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/timestamps/*.js'
	]
} );

var ts;
describe( "Module timestamps", function() {
	before( function( done ) {
		// Fetch Schema Module
		fireup( 'timestamps' ).then( function( m ) {
			ts = m;
			done();
		} );
	} );

	it( "should add created_at and updated_at field with current date to an object", function( done ) {
		var obj = { name: 'test' };

		obj = ts.add( obj );

		obj.should.properties( 'created_at' );

		done();
	} );

	it( "should add updated_at field with current date to an object", function( done ) {
		var obj = { name: 'test' };

		obj = ts.update( obj );

		obj.should.properties( 'updated_at' );

		done();
	} );
} );
