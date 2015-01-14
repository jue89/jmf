var gulp = require( 'gulp' );
var mocha = require( 'gulp-mocha' );
var gutil = require( 'gulp-util' );

// Run all tests
gulp.task( 'mocha', function() {
	return gulp.src( [ 'test/*.js'], { read: false, cwd: __dirname } )
		.pipe( mocha( { reporter: 'list' } ) )
		.on( 'error', gutil.log );
} )

// Watch for changes and run tests
gulp.task( 'watch-mocha', function() {
	gulp.watch( [ 'modules/**' ], [ 'mocha' ] );
} );

// Default task
gulp.task( 'default', [ 'mocha' ] );
