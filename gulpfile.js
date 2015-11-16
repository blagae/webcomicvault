var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('default', gulp.parallel('styles', 'scripts'));

gulp.task('scripts', function() {
	return gulp.src('private/scripts/**/*.js')
	.pipe(uglify())
	.pipe(concat("ang.min.js"))
	.pipe(gulp.dest('public/scripts'));
});