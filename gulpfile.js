var gulp = require( 'gulp' );
var mocha = require( 'gulp-mocha' );
var gutil = require( 'gulp-util' );
var jshint = require('gulp-jshint');


// Lint
gulp.task('lint', function() {
	return gulp.src( ['./index.js', './modules/**/*.js', './config/*.js', './test/*.js' ] )
		.pipe( jshint() )
		.pipe( jshint.reporter('default') );
});

// Run all tests
gulp.task( 'mocha', function() {
	return gulp.src( [ 'test/*.js'], { read: false, cwd: __dirname } )
		.pipe( mocha( { reporter: 'min' } ) )
		.on( 'error', gutil.log );
} )

// Watch for changes and run tests
gulp.task( 'watch', function() {
	gulp.watch( [ './modules/**/*.js', './test/*.js', './config.js', './index.js' ], [ 'lint', 'mocha' ] );
} );

// Default task
gulp.task( 'default', [ 'mocha', 'lint' ] );
