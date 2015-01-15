var should = require( 'should' );
var fs = require( 'fs' );
var fireupOpts = {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/db/*.js',
		{ implements: 'config', factory: function() {
			return {
				db: {
					client: 'sqlite3',
					connection: { filename: 'data.db' }
				}
			}
		} },
		{ implements: 'db/schema:t1', factory: function() { return [ {
			tableName: 'table1',
			build: function( tbl ) {
				tbl.integer( 'id' ).primary();
				tbl.string( 'field' );
			}
		} ] } },
		{ implements: 'db/schema:t2', factory: function() { return [ {
			tableName: 'table2',
			build: function( tbl ) {
				tbl.integer( 'id' ).primary();
				tbl.string( 'field' );
			}
		} ] } }
	]
};

var fireup = require( 'fire-up' ).newInjector;

var _db;
describe( "Module db", function() {

	before( function( done ) {
		// Remove old data
		if( fs.existsSync( 'data.db' ) ) fs.unlinkSync( 'data.db' );

		done();
	} );

	it( "should instantiate db module create non-existent tables", function( done ) {
		fireup( fireupOpts )( 'db' ).then( function( db ) {
			_db = db;

			db.schema.hasTable( 'table1' ).then( function( exists ) {
				exists.should.eql( true );
				return db.schema.hasTable( 'table2' );
			} ).then( function( exists ) {
				exists.should.eql( true );
				done();
			} );
		} )
	} );

	it( "should insert data into table", function( done ) {
		_db( 'table1' ).insert( { id: 1, field: 'test' } ).then( function() { done(); } );
	} );

	it( "should reinstantiate db module and not recreate tables", function( done ) {
		fireup( fireupOpts )( 'db' ).then( function( db ) {
			db( 'table1' ).select().then( function( data ) {
				data.length.should.eql( 1 );
				done();
			} );
		} )
	} );
} );
