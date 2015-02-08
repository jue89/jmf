var should = require( 'should' );
var fireupOpts = {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/mongo/*.js',
		{ implements: 'config', factory: function() { return {
			mongodb: {
				host: ['localhost'],
				db: 'test'
			}
		}; } },
		{ implements: 'mongo/test', inject: [ 'mongo' ], factory: function(m) {
			var col = m.collection( 'test' );
			col.drop();
			col.ensureIndex( { 'fingerprint': 1 }, { unique: true } );
			return col;
		} },
	]
};

var fireup = require( 'fire-up' ).newInjector;

var db;
describe( "Module mongo", function() {

	it( "should connect to db and ensure indices", function( done ) {
		fireup( fireupOpts )( 'mongo/test' ).then( function( _db ) {
			db = _db;
			done();
		} );
	} );

	it( "should insert data into collection", function( done ) {
		db.insert( { fingerprint: 'test' } ).then( function() { done(); } ).catch(done);
	} );

	it( "should read data from collection", function( done ) {
		db.find( ).then( function( docs ) {
			docs.length.should.eql( 1 );
			done();
		} );
	} );
} );
