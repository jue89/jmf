var should = require( 'should' );
var fireupOpts = {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/hooks/*.js',
		'./modules/mongo/*.js',
		'./modules/objhelper/*.js',
		'./modules/schema/*.js',
		{ implements: 'config', inject: ['require(uuid)'], factory: function(uuid) { return {
			mongodb: {
				servers: {
					host: 'localhost',
					port: 27017,
					options: { auto_reconnnect: true }
				},
				db: 'test-' + uuid.v4()
			}
		}; } },
		{ implements: 'mongo/test', inject: [ 'require(bluebird)', 'mongo' ], factory: function(P,m) {
			// Create collection
			var col = m.collection( 'test' );

			// Create indices
			var defered = P.all( [
				col.index( 'uniquefield', { unique: true } )
			] ).return( col );

			return defered;
		} },
	]
};

var fireup = require( 'fire-up' ).newInjector;
var P = require( 'bluebird' );

var db;
describe( "Module mongo", function() {

	it( "should connect to db and ensure indices", function( done ) {
		fireup( fireupOpts )( 'mongo/test' ).then( function( _db ) {
			db = _db;
			done();
		} );
	} );

	it( "should insert 50 documents into collection", function( done ) {
		var stack = [];
		for( var i = 0; i < 50; i++ ) {
			stack.push( db.insert( {
				field: 'Test',
				uniquefield: i,
				date: new Date()
			} ) );
		}
		P.all( stack ).then( function( docs ) {
			docs.length.should.eql( 50 );
			done();
		} ).catch( done );
	} );

	it( "should reject inserting a documents due to collision with unique index", function( done ) {
		db.insert( {
			field: 'Test',
			uniquefield: 1,
			date: new Date()
		} ).catch( function( e ) {
			e.code.should.eql( 11000 );
			done();
		} );
	} );

	it( "should read all documents from collection", function( done ) {
		db.fetch().then( function( docs ) {
			docs.count.should.eql( 50 );
			done();
		} );
	} );

	it( "should read all documents from collection ordered by uniquefield asc", function( done ) {
		db.fetch( {
			sort: '+uniquefield'
		} ).then( function( docs ) {
			docs.count.should.eql( 50 );
			for( var i = 0; i < 50; i++ ) {
				docs.data[i].uniquefield.should.eql( i );
			}
			done();
		} );
	} );

	it( "should read all documents from collection ordered by uniquefield desc", function( done ) {
		db.fetch( {
			sort: '-uniquefield'
		} ).then( function( docs ) {
			docs.count.should.eql( 50 );
			for( var i = 0; i < 50; i++ ) {
				docs.data[i].uniquefield.should.eql( 49 - i );
			}
			done();
		} );
	} );

	it( "should read first ten documents from collection", function( done ) {
		db.fetch( {
			sort: '+uniquefield',
			limit: 10,
			page: 0
		} ).then( function( docs ) {
			docs.count.should.eql( 50 );
			docs.limit.should.eql( 10 );
			docs.data.length.should.eql( 10 );
			for( var i = 0; i < 10; i++ ) {
				docs.data[i].uniquefield.should.eql( i );
			}
			done();
		} );
	} );

	it( "should read next ten documents from collection", function( done ) {
		db.fetch( {
			sort: '+uniquefield',
			limit: 10,
			page: 1
		} ).then( function( docs ) {
			docs.count.should.eql( 50 );
			docs.limit.should.eql( 10 );
			docs.data.length.should.eql( 10 );
			for( var i = 0; i < 10; i++ ) {
				docs.data[i].uniquefield.should.eql( 10 + i );
			}
			done();
		} );
	} );

	it( "should just return field 'uniquefield'", function( done ) {
		db.fetch( {
			fields: [ 'uniquefield' ]
		} ).then( function( docs ) {
			docs.count.should.eql( 50 );
			for( var i = 0; i < 50; i++ ) {
				docs.data[i].should.not.property( 'date' );
				docs.data[i].should.not.property( 'field' );
				docs.data[i].should.property( 'uniquefield' );
			}
			done();
		} );
	} );

	it( "should update first document", function( done ) {
		db.update( {
			selector: { uniquefield: 0 },
			modifier: {
				$set: { field: "Test2" }
			}
		} ).then( function( docs ) {
			docs.field.should.eql( 'Test2' );
			done();
		} );
	} );

	it( "should remove second document", function( done ) {
		db.drop( {
			selector: { uniquefield: 1 },
		} ).then( function( no ) {
			no.should.eql( 1 );
			done();
		} );
	} );

} );
