'use strict';

const { series, src, dest, watch } = require('gulp');
const uglifycss = require('gulp-uglifycss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');

function scssTask () {
  return src('./src/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(uglifycss({"uglyComments": true}))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest('./assets/css/'));
};

watch('./src/sass/**/*.scss', scssTask);

exports.default = series(scssTask);
