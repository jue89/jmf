var should = require( 'should' );
var P = require('bluebird');
var oid = require( 'mongodb' ).ObjectID;
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/hooks/*.js',
		'./modules/mongo/*.js',
		'./modules/schema/*.js',
		'./modules/objhelper/*.js',
		'./modules/timestamps/*.js',
		'./modules/models/*.js',
		{ implements: 'config', inject: ['require(uuid)'], factory: function(uuid) {
			var tmp = uuid.v4();
			console.log( "Database: " + tmp );
			return {
				mongodb: {
					servers: {
						host: 'localhost',
						port: 27017,
						options: { auto_reconnnect: true }
					},
					db: 'test-' + tmp
				}
			};
		} },
		{ implements: 'model:A', inject: ['mongo/objectid'], factory: function(oid) { return { 
			idGenerator: oid,
			schema: {
				'_id': { mandatory: true, type: 'objectid' },
				'name': { type: 'string', default: 'Test-a' }
			},
			index: [
				'name'
			]
		}; } },
		{ implements: 'model:B', inject: ['mongo/objectid'], factory: function(oid) { return { 
			idGenerator: oid,
			schema: {
				'_id': { mandatory: true, type: 'objectid' },
				'name': { type: 'string', default: 'Test-b' },
				'a1': 'A',
				'a2': 'A'
			},
			index: [
				[ 'name', { unique: true } ],
				'a1',
				'a2'
			]
		}; } },
		{ implements: 'model:C', inject: ['mongo/objectid'], factory: function(oid) { return { 
			idGenerator: oid,
			schema: {
				'_id': { mandatory: true, type: 'objectid' },
				'name': { type: 'string', default: 'Test-c' },
				'b': 'B'
			},
			reject: [ 'drop' ]
		}; } }
	]
} );

var models;
describe( "Module models", function() {
	before( function( done ) {
		// Fetch Roles Module
		fireup( 'models' ).then( function( m ) {
			models = m;
			done();
		} );
	} );

	var idA = [];
	it( "should add new items into A", function( done ) {
		var jobs = [];
		for( var i = 0; i < 50; i++ ) {
			jobs.push( models.A.insert( {
				req: {
					name: "Test " + i
				},
				i: i
			}).then( function( obj ) {
				idA[ obj.i ] = obj.res._id;
			} ) );
		}
		
		P.all( jobs ).then( function() { done(); } );
	} );

	var idB;
	it( "should add new item into B with reference to A", function( done ) {
		models.B.insert({ req: {
			'a1': idA[0],
			'a2': idA[1]
		} }).then( function( obj ) {
			idB = obj.res._id;
			done();
		} );
	} );

	it( "should reject adding new item into B without existing reference to A", function( done ) {
		models.B.insert( { req: {
			'a1': oid().toString(),
			'a2': idA[1]
		} } ).catch( function( e ) {
			e.name.should.eql( 'ModelsError' );
			e.type.should.eql( 'related-object-not-found' );
			done();
		} );
	} );

	var idC;
	it( "should add new item into C with reference to B", function( done ) {
		models.C.insert({ req: {
			'b': idB
		} }).then( function( obj ) {
			idC = obj.res._id;
			done();
		} );
	} );

	it( "should fetch item from A", function( done ) {
		models.A.fetch( ).then( function( obj ) {
			obj.res.A[0]._id.should.eql( idA[0] );
			done();
		} );
	} );

	it( "should fetch item from B and include a1, a2 and b", function( done ) {
		models.B.fetch( {req:{include:['a1','a2','b']}} ).then( function( obj ) {
			obj.res.linked.A[0]._id.should.eql( idA[0] );
			obj.res.linked.A[1]._id.should.eql( idA[1] );
			obj.res.linked.C[0]._id.should.eql( idC );
			done();
		} );
	} );

	it( "should reject fetching item B due to unkown include", function( done ) {
		models.B.fetch( {req:{include:['unkown']}} ).catch( function( e ) {
			e.name.should.eql( 'ModelsError' );
			e.type.should.eql( 'unkown-relation' );
			done();
		} );
	} );

	it( "should fetch item from B, include objects and select fields required for relation", function( done ) {
		models.B.fetch( { req: {
			include: [ 'a1' , 'a2' , 'b' ],
			fields: {
				A: [ '_id' ],
				B: [ '_id' ],
				C: [ '_id' ]
			}
		} } ).then( function( obj ) {
			obj.res.B[0].should.property( 'a1' );
			obj.res.B[0].should.property( 'a2' );
			obj.res.linked.C[0].should.property( 'b' );
			done();
		} );
	} );

	it( "should update item in B and set a new a2", function( done ) {
		models.B.update( { req: {
			'selector': { _id: idB },
			'modifier': { '$set': {
				a2: idA[2]
			} }
		} } ).then( function( obj ) {
			obj.res.a2.should.eql( idA[2] );
			obj.res.should.property( 'updated_at' );
			done();
		} );
	} );

	it( "should reject updating item in B without existing reference to A", function( done ) {
		models.B.update( { req: {
			'selector': { _id: idB },
			'modifier': { '$set': {
				a2: new oid().toString()
			} }
		} } ).catch( function( e ) {
			e.name.should.eql( 'ModelsError' );
			e.type.should.eql( 'related-object-not-found' );
			done();
		} );
	} );

	it( "should reject dropping items due to depending objects", function( done ) {
		models.A.drop( { req: {
			'selector': { _id: idA[2] },
		} } ).catch( function( e ) {
			e.name.should.eql( 'ModelsError' );
			e.type.should.eql( 'depending-related-object' );
			done();
		} );
	} );

	it( "should drop item from A", function( done ) {
		models.A.drop( { req: {
			'selector': { _id: idA[1] },
		} } ).then( function( obj ) {
			obj.res[0]._id.should.eql( idA[1] );
			done();
		} );
	} );

	it( "should reject dropping items from C due to defined model constraints", function( done ) {
		models.C.drop( { req: {
			'selector': { _id: idC },
		} } ).catch( function( e ) {
			e.name.should.eql( 'ModelsError' );
			e.type.should.eql( 'action-prohibited' );
			done();
		} );
	} );

} );
