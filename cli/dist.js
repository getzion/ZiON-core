"use strict";

// Shared
const gulp = require('gulp');
const fs = require('fs');
const plumber = require('gulp-plumber');
const path = require('path');
const merge = require('merge-stream');
const preprocess = require('gulp-preprocess');
const util = require('util');
const registry = require('undertaker-registry');
const tap = require('gulp-tap');
const buffer = require('gulp-buffer');
const browserify = require('browserify');
const include = require("gulp-include");


// Pug
const pug = require ('pug');
const pretty = require('pretty');
// const pretty = require('js-beautify').html;


// SCSS
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const rtlcss = require('gulp-rtlcss');
const sourcemaps = require('gulp-sourcemaps');



function DistRegistry() {
  registry.call(this);
}
util.inherits(DistRegistry, registry);

DistRegistry.prototype.init = function(gulp) {

  gulp.task('dist:scss', ()=>{
    return gulp.src('./src/scss/**/*.scss')
        // Todo: Add preprocessor for ZION_ENV in SCSS
        // .pipe(preprocess({context: { ZION_ENV : 'PRODUCTION'}}))
      .pipe(plumber())
      // .pipe(sourcemaps.init())
      .pipe(sass({
            outputStyle : 'expanded',
            // Todo: decide whether to add or not add burbon,
            // we have used it just for modular-scale and it was problematic to
            // configure when the user is using the scss modules independently/
            // includePaths: require('node-bourbon').includePaths
            // includePaths: JSON.parse(fs.readFileSync('./zion-config.json')).includePaths
            includePaths: ['node_modules']
        }).on('error', sass.logError))
      .pipe(autoprefixer({
          browsers: ['last 5 versions'],
          cascade: false
      }))
      // .pipe(sourcemaps.write())
      .pipe(plumber.stop())
      .pipe(gulp.dest('./dist/css'))

      // Todo: Add option whether to compile RTL, or only RTL.
      // .pipe(rtlcss()) // Convert to RTL.
      // .pipe(rename({ suffix: '-rtl' })) // Append "-rtl" to the filename.
      // .pipe(gulp.dest('./temp/css'))
      // .pipe(browserSync.stream());
  });

  gulp.task('dist:js', () => {
    return gulp.src('./src/js/**/*.js')
      .pipe(include({
       extensions: 'js',
        // hardFail: true,
        includePaths: [
          'node_modules'
        ]
      }))
      .pipe(gulp.dest('./dist/js'));
  });

  gulp.task('dist:images', () => {
    return gulp.src('./src/images/**/*.*')
      .pipe(gulp.dest('./dist/images'));
  });

  gulp.task('dist:images:blur', (done) => {
    //Todo: Blur selected images in the dist, read from zion-congit.json
    done();
  });


}
module.exports = new DistRegistry();
