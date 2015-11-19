var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minify = require('gulp-minify-css');
var del = require('del');
var lint = require('gulp-jshint');

gulp.task('lint', function() {
    return gulp.src('private/scripts/**/*.js')
            .pipe(lint())
            .pipe(lint.reporter('default'))
            .pipe(lint.reporter('fail'));
});
 
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
	//.pipe(uglify()) // TODO: uncomment
	.pipe(concat("ang.min.js"))
	.pipe(gulp.dest('public/scripts'));
});

gulp.task('images', function() {
	return gulp.src('private/images/*.*')
	.pipe(gulp.dest('public/images'));
});

gulp.task('default', gulp.series('lint', 'clean', gulp.parallel('styles', 'scripts', 'images')));
