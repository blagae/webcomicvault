var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minify = require('gulp-minify-css');
var del = require('del');
var lint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');

gulp.task('lint', function () {
    return gulp.src('private/scripts/**/*.js')
        .pipe(lint())
        .pipe(lint.reporter('default'))
        .pipe(lint.reporter('fail'));
});

gulp.task('clean', function () {
    return del(['public/**/*']);
});

gulp.task('styles', function () {
    return gulp.src('private/styles/*.less')
        .pipe(less())
        .pipe(minify())
        .pipe(concat("style.css"))
        .pipe(gulp.dest('public/styles'));
});

gulp.task('scripts', function () {
    return gulp.src('private/scripts/**/*.js')
        .pipe(uglify())
        .pipe(concat("ang.min.js"))
        .pipe(gulp.dest('public/scripts'));
});

gulp.task('images', function () {
    return gulp.src('private/images/*.*')
        .pipe(gulp.dest('public/images'));
});

gulp.task('init', gulp.series('lint', // fail early
    'clean',
    gulp.parallel('styles', 'scripts', 'images')));



gulp.task('go', gulp.series('init', gulp.parallel(function (done) {
    gulp.watch('private/images/*.*', gulp.parallel('images'));
    gulp.watch('private/styles/*.css', gulp.parallel('styles'));
    gulp.watch('private/scripts/**/*.js', gulp.series('lint', 'scripts'));

    done();
})));

gulp.task('default', gulp.series('go', function () {
    nodemon({script: './bin/www'
            //, tasks: ['go'] 
    })
        .on('restart', function () {
            console.log('restarted!');
        });
}));
