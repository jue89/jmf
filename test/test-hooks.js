var should = require( 'should' );
var fireup = require( 'fire-up' ).newInjector( {
	basePath: __dirname + '/..',
	bustRequireCache: true,
	require: require,
	modules: [
		'./modules/hooks/*.js',
		{ implements: 'hook:h1', factory: function() { return { test: {
			action1: {
				priority: 1,
				action: function( args ) {
					args.first = true;
					args.test = 1;
					return args;
				}
			}
		} }; } },
		{ implements: 'hook:h2', factory: function() { return { test: {
			action1: {
				priority: 0,
				action: function( args ) {
					args.second = true;
					args.test = 2;
					return args;
				}
			}
		} }; } },
		{ implements: 'hook:h3', inject: 'require(bluebird)', factory: function(P) { return { test: {
			action2: {
				action: function( args ) { return new P( function( resolve, reject ) {
					reject();
				} ); }
			}
		} }; } }
	]
} );

var hooks;
describe( "Module hooks", function() {
	before( function( done ) {
		// Fetch Schema Module
		fireup( 'hooks' ).then( function( m ) {
			hooks = m( 'test', ['action1','action2','action3'] );
			done();
		} );
	} );

	it( "should call all hooks of one action", function( done ) {
		hooks.action1( {} ).then( function( args ) {
			args.first.should.eql( true );
			args.second.should.eql( true );
			done();
		} );
	} );

	it( "should call non-promised actions in the right order", function( done ) {
		hooks.action1( {} ).then( function( args ) {
			args.test.should.eql( 2 );
			done();
		} );
	} );

	it( "should call promise hook that halts execution queue", function( done ) {
		hooks.action2( {} ).catch( function( ) {
			done();
		} );
	} );

	it( "should bypass hooks without actions", function( done ) {
		hooks.action3( { test: true } ).then( function( args ) {
			args.test.should.eql( true );
			done();
		} );
	} );
} );
