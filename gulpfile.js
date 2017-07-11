'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const eslint = require('gulp-eslint');
var concat = require('gulp-concat');

const sourceFiles = [
    'bin/**/*.js',
    'signet-types.js',
    'index.js',
    '!node_modules/**'
];

const testFiles = [
    'test/**/*.js'
];

gulp.task('compile', function() {
  return gulp.src(sourceFiles)
    .pipe(concat('matchlight.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('lint', () => {
    return gulp.src(sourceFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('pre-test', function () {
    return gulp.src(sourceFiles)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['lint', 'pre-test'], function () {
    gulp.src(testFiles, { read: false })
        .pipe(mocha())
        .pipe(istanbul.writeReports({ reporters: ['text-summary'] }))
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 80 } }));
});

gulp.task('build', ['test', 'compile']);
