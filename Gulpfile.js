'use strict';

const { series, src, dest, watch } = require('gulp');
const uglifycss = require('gulp-uglifycss');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');

function scssTask () {
  return src('./src/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(uglifycss({"uglyComments": true}))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest('./assets/css/'));
}

function javascriptTask () {
  return src('./src/scripts/main.js')
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest('./assets/scripts/'));
}

watch(['./src/sass/**/*.scss', './src/scripts/**/*.js'], series(scssTask, javascriptTask));

exports.default = series(scssTask, javascriptTask);
