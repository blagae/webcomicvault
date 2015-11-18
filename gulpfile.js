var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minify = require('gulp-minify-css');
var del = require('del');
 
gulp.task('clean', function () {
	return del(['public/**/*']);
});

gulp.task('styles', function() {
	return gulp.src('private/styles/*.css')
	.pipe(sass())
	.pipe(minify())
	.pipe(concat("style.css"))
	.pipe(gulp.dest('public/styles'));
});

gulp.task('scripts', function() {
	return gulp.src('private/scripts/**/*.js')
	.pipe(uglify())
	.pipe(concat("ang.min.js"))
	.pipe(gulp.dest('public/scripts'));
});

gulp.task('images', function() {
	return gulp.src('private/images/*.*')
	.pipe(gulp.dest('public/images'));
});

gulp.task('default', gulp.series('clean', gulp.parallel('styles', 'scripts', 'images')));
