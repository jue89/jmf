var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/schema/*.js'
	]
} );

var schema;

describe( "Module schema", function() {
	before( function( done ) {
		// Fetch Schema Module
		fireup( 'schema' ).then( function( m ) {
			schema = m;
			done();
		} );
	} );

	it( "should complain missing field", function( done ) {
		var test = schema( {
			'field': { mandatory: true }
		} );

		test( {} ).catch( function( e ) {
			e.type.should.eql( 'missing-field' );
			done();
		} );
	} );

	it( "should complain missing sub-field", function( done ) {
		var test = schema( {
			'field.subfield': { mandatory: true }
		} );

		test( { 'field' : {} } ).catch( function( e ) {
			e.type.should.eql( 'missing-field' );
			done();
		} );
	} );

	it( "should complain missing sub-sub-field", function( done ) {
		var test = schema( {
			'field.subfield.subsubfiled': { mandatory: true }
		} );

		test( { 'field' : { 'subfield': {} } } ).catch( function( e ) {
			e.type.should.eql( 'missing-field' );
			done();
		} );
	} );

	it( "should not complain missing non-mandatory field", function( done ) {
		var test = schema( {
			'field': { mandatory: false }
		} );

		test( {} ).then( function() {
			done();
		} );
	} );

	it( "should complain undefined field", function( done ) {
		var test = schema( {
		} );

		test( { 'field' : 'test' } ).catch( function( e ) {
			e.type.should.eql( 'illegal-field' );
			done();
		} );
	} );

	it( "should complain wrong type (boolean)", function( done ) {
		var test = schema( {
			'field': { type: 'boolean', mandatory: true }
		} );

		test( { 'field': 0 } ).catch( function( e ) {
			e.type.should.eql( 'wrong-type' );
			done();
		} );
	} );

	it( "should complain wrong type (number)", function( done ) {
		var test = schema( {
			'field': { type: 'number' }
		} );

		test( { 'field': 'test' } ).catch( function( e ) {
			e.type.should.eql( 'wrong-type' );
			done();
		} );
	} );

	it( "should complain wrong type (string)", function( done ) {
		var test = schema( {
			'field': { type: 'string' }
		} );

		test( { 'field': ['test'] } ).catch( function( e ) {
			e.type.should.eql( 'wrong-type' );
			done();
		} );
	} );

	it( "should complain wrong type (array)", function( done ) {
		var test = schema( {
			'field': { type: 'array' }
		} );

		test( { 'field': true } ).catch( function( e ) {
			e.type.should.eql( 'wrong-type' );
			done();
		} );
	} );

	it( "should accept right type (boolean)", function( done ) {
		var test = schema( {
			'field': { type: 'boolean' }
		} );

		test( { 'field': true } ).then( function( ) {
			done();
		} );
	} );

	it( "should accept right type (number)", function( done ) {
		var test = schema( {
			'field': { type: 'number' }
		} );

		test( { 'field': 1 } ).then( function( e ) {
			done();
		} );
	} );

	it( "should accept right type (string)", function( done ) {
		var test = schema( {
			'field': { type: 'string' }
		} );

		test( { 'field': 'test' } ).then( function( ) {
			done();
		} );
	} );

	it( "should accept right type (array)", function( done ) {
		var test = schema( {
			'field': { type: 'array' }
		} );

		test( { 'field': [true] } ).then( function( ) {
			done();
		} );
	} );

	it( "should complain wrong pattern", function( done ) {
		var test = schema( {
			'field': { type: 'string', pattern: '^#[0-9a-f]{6}$' }
		} );

		test( { 'field': '#aa994g' } ).catch( function( e ) {
			e.type.should.eql( 'wrong-format' );
			done();
		} );
	} );

	it( "should accept right pattern", function( done ) {
		var test = schema( {
			'field': { type: 'string', pattern: '^#[0-9a-f]{6}$' }
		} );

		test( { 'field': '#aa994f' } ).then( function( ) {
			done();
		} );
	} );

	it( "should complain wrong predefined pattern", function( done ) {
		var test = schema( {
			'field': { type: 'color' }
		} );

		test( { 'field': '#aa994g' } ).catch( function( e ) {
			e.type.should.eql( 'wrong-format' );
			done();
		} );
	} );

	it( "should accept right predefined pattern", function( done ) {
		var test = schema( {
			'field': { type: 'color' }
		} );

		test( { 'field': '#aa994f' } ).then( function( ) {
			done();
		} );
	} );

	it( "should complain exceeded max length", function( done ) {
		var test = schema( {
			'field': { type: 'string', maxLength: 3 }
		} );

		test( { 'field': '1234' } ).catch( function( e ) {
			e.type.should.eql( 'max-length-exceeded' );
			done();
		} );
	} );

	it( "should accept right max length", function( done ) {
		var test = schema( {
			'field': { type: 'string', maxLength: 3 }
		} );

		test( { 'field': '123' } ).then( function( ) {
			done();
		} );
	} );

	it( "should complain dropoing below min length", function( done ) {
		var test = schema( {
			'field': { type: 'string', minLength: 3 }
		} );

		test( { 'field': '12' } ).catch( function( e ) {
			e.type.should.eql( 'min-length-dropped-below' );
			done();
		} );
	} );

	it( "should accept right min length", function( done ) {
		var test = schema( {
			'field': { type: 'string', minLength: 3 }
		} );

		test( { 'field': '123' } ).then( function( ) {
			done();
		} );
	} );

} );
