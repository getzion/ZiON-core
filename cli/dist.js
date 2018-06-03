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
    return gulp.src('./src/scss/style.scss')
        // Todo: Add preprocessor for ZION_ENV in SCSS
        // .pipe(preprocess({context: { ZION_ENV : 'PRODUCTION'}}))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass({
            outputStyle : 'expanded'
            // Todo: decide whether to add or not add burbon,
            // we have used it just for modular-scale and it was problematic to
            // configure when the user is using the scss modules independently/
            // includePaths: require('node-bourbon').includePaths
        }).on('error', sass.logError))
      .pipe(autoprefixer({
          browsers: ['last 5 versions'],
          cascade: false
      }))
      .pipe(sourcemaps.write())
      .pipe(plumber.stop())
      .pipe(gulp.dest('./dist/css'))

      // Todo: Add option whether to compile RTL, or only RTL.
      // .pipe(rtlcss()) // Convert to RTL.
      // .pipe(rename({ suffix: '-rtl' })) // Append "-rtl" to the filename.
      // .pipe(gulp.dest('./temp/css'))
      // .pipe(browserSync.stream());
  });

}
module.exports = new DistRegistry();