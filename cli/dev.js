"use strict";

// Shared
const gulp = require('gulp');
const util = require('util');
const registry = require('undertaker-registry');
const fs = require('fs');
const plumber = require('gulp-plumber');
const path = require('path');
const merge = require('merge-stream');
const preprocess = require('gulp-preprocess');


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


// Hot reloading
const browserSync = require('browser-sync').create();




/**
 * Browsersync middleware function
 * Compiles .pug files with browsersync
*/
const compilePug = (req, res, next) => {
    var parsed = require("url").parse(req.url);

    if (parsed.pathname.match(/\.html$/) || parsed.pathname == '/') {

        var file = 'index';

        if(parsed.pathname != '/'){
            file = parsed.pathname.substring(1, (parsed.pathname.length - 5));
        }
        // Todo: index fallback for subfolders
        var html = pug.renderFile(path.join(__dirname+'../../src/pug/'+file+'.pug'), {ZION_ENV:'DEV', pretty:true});
        html = pretty(html, {ocd: false});

        html = html.replace(/\s*(<!-- end of)/g, '$1' );

        fs.writeFileSync('./temp/'+file+'.html', html);

    }

    next();
}




//----------------------------------------------
//  Using gulp registry for shared tasks
//  https://github.com/gulpjs/gulp/blob/4.0/docs/API.md#gulpregistryregistry
//----------------------------------------------

function DevRegistry() {
  registry.call(this);
}
util.inherits(DevRegistry, registry);

DevRegistry.prototype.init = function(gulp) {
  gulp.task('console', (done)=>{
    console.log("Printing from zion-core/cli/dev.js");
    done();
  });

  // Todo: make dynamic and do with promise
  gulp.task('dev:assets', ()=>{
    const tasks = ['videos', 'fonts', 'lib', 'lang'].map(function(folder) {
        return gulp.src('./src/'+folder+'/**/*.*')
          .pipe(gulp.dest('temp/'+folder));
      });
    return merge(tasks);
  });

  gulp.task('dev:images', ()=>{
    return gulp.src('./src/images/**/{*.jpg,*.png,*.gif,*.ico,*.svg}')
        // .pipe(watch('./images/**/{*.jpg,*.png,*.gif,*.ico,*.svg}'))
        .pipe(rename(function(path){
            if(path.basename.substring(0, 6)=='dist--'){
                path.basename = path.basename.substring(6, path.basename.length);
            }
        }))
        .pipe(gulp.dest('temp/images'));
  });

  gulp.task('dev:js', ()=>{
    // Todo: Add babble
    return gulp.src(['./src/js/**/*.js'])
        .pipe(preprocess({context: { ZION_ENV : 'DEBUG'}}))
        .pipe(gulp.dest('temp/js/'));
  });

  gulp.task('dev:scss', ()=>{
    return gulp.src('./src/scss/**/*.scss')
        // Todo: Add preprocessor for ZION_ENV in SCSS
        // .pipe(preprocess({context: { ZION_ENV : 'DEBUG'}}))
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
      .pipe(gulp.dest('./temp/css'))
      .pipe(browserSync.stream())
      // Todo: Add option whether to compile RTL, or only RTL.
      // .pipe(rtlcss()) // Convert to RTL.
      // .pipe(rename({ suffix: '-rtl' })) // Append "-rtl" to the filename.
      // .pipe(gulp.dest('./temp/css'))
      // .pipe(browserSync.stream());
  });

  gulp.task('dev:npm', ()=>{
    // Todo: Think it should be updated since we are handling things via zion-config.json
    return gulp.src(npmMainfiles(), { base: "./node_modules" })
        .pipe(gulp.dest('temp/lib'));
  });

  gulp.task('dev:serve', ()=>{
    browserSync.init({
      server: {
          baseDir: "temp/"
      },
      port: 3000,
      open: false,
      notify: false,
      middleware: compilePug
    });
  });

  gulp.task('dev:watch', ()=>{
    gulp.watch('./src/pug/**/*.pug', gulp.parallel(function(done){
      browserSync.reload();
      done()
    }));
  });

  gulp.task('dev', gulp.parallel('dev:assets', 'dev:scss', 'dev:serve', 'dev:watch'));

};

module.exports = new DevRegistry();
