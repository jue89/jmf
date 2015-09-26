var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/objhelper/*.js'
	]
} );

var oh;

describe( "Module objhelper", function() {
	before( function( done ) {
		// Fetch Schema Module
		fireup( 'objhelper' ).then( function( m ) {
			oh = m;
			done();
		} );
	} );

	it( "should depack flat object", function( done ) {
		oh.depack( {
			'field1': 'test',
			'field2': 'test2'
		} ).should.eql ( {
			'field1': 'test',
			'field2': 'test2'
		} );

		done();
	} );

	it( "should pack flat object", function( done ) {
		oh.pack( {
			'field1': 'test',
			'field2': 'test2'
		} ).should.eql ( {
			'field1': 'test',
			'field2': 'test2'
		} );

		done();
	} );

	it( "should depack nested object", function( done ) {
		oh.depack( {
			'field1': 'test',
			'test': {
				'subfield1': 'test2',
				'subfield2': 'test3'
			}
		} ).should.eql ( {
			'field1': 'test',
			'test.subfield1': 'test2',
			'test.subfield2': 'test3'
		} );

		done();
	} );

	it( "should pack nested object", function( done ) {
		oh.pack( {
			'field1': 'test',
			'test.subfield1': 'test2',
			'test.subfield2': 'test3'
		} ).should.eql ( {
			'field1': 'test',
			'test': {
				'subfield1': 'test2',
				'subfield2': 'test3'
			}
		} );

		done();
	} );

	it( "should depack array of strings", function( done ) {
		oh.depack( {
			'field1': 'test',
			'test': [
				'test2',
				'test3'
			]
		} ).should.eql ( {
			'field1': 'test',
			'test[0]': 'test2',
			'test[1]': 'test3'
		} );

		done();
	} );

	it( "should pack array of strings", function( done ) {
		oh.pack( {
			'field1': 'test',
			'test[0]': 'test2',
			'test[1]': 'test3'
		} ).should.eql ( {
			'field1': 'test',
			'test': [
				'test2',
				'test3'
			]
		} );

		done();
	} );

	it( "should depack nested array of strings", function( done ) {
		oh.depack( {
			'field1': 'test',
			'test': {
				'subfield1': 'test',
				'subfield2': [
					'test2',
					'test3'
				]
			}
		} ).should.eql ( {
			'field1': 'test',
			'test.subfield1': 'test',
			'test.subfield2[0]': 'test2',
			'test.subfield2[1]': 'test3'
		} );

		done();
	} );

	it( "should pack nested array of strings", function( done ) {
		oh.pack( {
			'field1': 'test',
			'test.subfield1': 'test',
			'test.subfield2[0]': 'test2',
			'test.subfield2[1]': 'test3'
		} ).should.eql ( {
			'field1': 'test',
			'test': {
				'subfield1': 'test',
				'subfield2': [
					'test2',
					'test3'
				]
			}
		} );

		done();
	} );

	it( "should depack array of objects", function( done ) {
		oh.depack( {
			'field1': 'test',
			'test': [ {
				'subfield': 'test2'
			}, {
				'subfield': 'test3'
			} ]
		} ).should.eql ( {
			'field1': 'test',
			'test[0].subfield': 'test2',
			'test[1].subfield': 'test3'
		} );

		done();
	} );

	it( "should pack array of objects", function( done ) {
		oh.pack( {
			'field1': 'test',
			'test[0].subfield': 'test2',
			'test[1].subfield': 'test3'
		} ).should.eql ( {
			'field1': 'test',
			'test': [ {
				'subfield': 'test2'
			}, {
				'subfield': 'test3'
			} ]
		} );

		done();
	} );

	it( "should depack array of objects with sub-array", function( done ) {
		oh.depack( {
			'field1': 'test',
			'test': [ {
				'subfield': [ 'test2' ]
			}, {
				'subfield': [ 'test3' ]
			} ]
		} ).should.eql ( {
			'field1': 'test',
			'test[0].subfield[0]': 'test2',
			'test[1].subfield[0]': 'test3'
		} );

		done();
	} );

	it( "should pack array of objects with sub-array", function( done ) {
		oh.pack( {
			'field1': 'test',
			'test[0].subfield[0]': 'test2',
			'test[1].subfield[0]': 'test3'
		} ).should.eql ( {
			'field1': 'test',
			'test': [ {
				'subfield': [ 'test2' ]
			}, {
				'subfield': [ 'test3' ]
			} ]
		} );

		done();
	} );

} );
