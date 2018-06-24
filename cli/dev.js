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
const npmMainfiles = require('gulp-npm-mainfiles');
const include = require("gulp-include");
const watch = require('gulp-watch');
const zionconfig = require('../zionconfig');



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

        let file = 'index';

        if(parsed.pathname != '/'){
            file = parsed.pathname.substring(1, (parsed.pathname.length - 5));
        }

        // Todo: index fallback for subfolders
        var html = pug.renderFile(path.resolve(`${process.cwd()}/${zionconfig.src.pug}/${file}.pug`), {ZION_ENV:'DEV', skeleton: __dirname, pretty:true});
        html = pretty(html, {ocd: false});

        html = html.replace(/\s*(<!-- end of)/g, '$1' );

        fs.writeFileSync(`${zionconfig.temp.root}/${file}.html`, html);

    }

    next();
}




//----------------------------------------------
//  Using gulp registry for shared tasks
//  https://github.com/gulpjs/gulp/blob/4.0/docs/API.md#gulpregistryregistry
//----------------------------------------------

function DevRegistry() {
  try{
    registry.call(this);
  }catch(err){
    console.log(err)
  }

}
util.inherits(DevRegistry, registry);

DevRegistry.prototype.init = function(gulp) {

  // Todo: make dynamic and do with promise
  gulp.task('dev:assets', () => {
    const tasks = ['videos', 'fonts', 'lib', 'lang'].map(function(folder) {
        return gulp.src(`${zionconfig.src.root}/${folder}/**/*.*`)
          .pipe(gulp.dest(`${zionconfig.temp.root}/${folder}`));
      });
    return merge(tasks);
  });

  gulp.task('dev:images', ()=>{
    return gulp.src(`${zionconfig.src.images}/**/{*.jpg,*.png,*.gif,*.ico,*.svg}`)
        // Todo: Make the paths dry for watch
        .pipe(watch(`${zionconfig.src.images}/**/{*.jpg,*.png,*.gif,*.ico,*.svg}`))
        // Todo: get the blurimages option from zionconfig.json
        .pipe(rename(function(path){
            if(path.basename.substring(0, 6)=='dist--'){
                path.basename = path.basename.substring(6, path.basename.length);
            }
        }))
        .pipe(gulp.dest(`${zionconfig.temp.root}/${zionconfig.src.images}`));
  });





  gulp.task('dev:js', () => {

    // Todo: Add babble
    // Todo: Make the paths dry for watch
    return gulp.src(`${zionconfig.src.js}/**/*.js`)
      .pipe(plumber())
      .pipe(include({
        extensions: 'js',
        includePaths: [
          'node_modules'
        ]
      }))
      .pipe(preprocess({context: { ZION_ENV : 'DEBUG'}}))
      .pipe(gulp.dest(`${zionconfig.temp.root}/${zionconfig.src.images}`))
      .pipe(plumber.stop());
  });






  gulp.task('dev:scss', ()=>{
    return gulp.src(`${zionconfig.src.scss}/**/*.scss`)
      // Todo: Make the paths dry for watch
      // .pipe(watch(`${zionconfig.src.scss}/**/*.scss`))
      // Todo: Add preprocessor for ZION_ENV in SCSS
      // .pipe(preprocess({context: { ZION_ENV : 'DEBUG'}}))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass({
            outputStyle : 'expanded',
            // Todo: decide whether to add or not add burbon,
            // we have used it just for modular-scale and it was problematic to
            // configure when the user is using the scss modules independently/
            // includePaths: require('node-bourbon').includePaths
            // Todo: making things dry between dev dist and live
            includePaths: [
              'node_modules',
              'node_modules/zion/scss/'
            ]
        }).on('error', sass.logError))
      .pipe(autoprefixer({
          browsers: ['last 5 versions'],
          cascade: false
      }))
      .pipe(sourcemaps.write())
      .pipe(include({
        extensions: 'css',
        includePaths: [
          'node_modules'
        ]
      }))
      .pipe(plumber.stop())
      .pipe(gulp.dest(`${zionconfig.temp.css}`))
      .pipe(browserSync.stream())
      // Todo: Add option whether to compile RTL, or only RTL.
      // .pipe(rtlcss()) // Convert to RTL.
      // .pipe(rename({ suffix: '-rtl' })) // Append "-rtl" to the filename.
      // .pipe(gulp.dest('./temp/css'))
      // .pipe(browserSync.stream());
  });

  gulp.task('dev:npm', () => {
    // Todo: Think it should be updated since we are handling things via zion-config.json
    return gulp.src(npmMainfiles(), { base: "./node_modules" })
        .pipe(gulp.dest(`${zionconfig.temp.lib}`));
  });

  gulp.task('dev:serve', ()=>{
    browserSync.init({
      server: {
          baseDir: zionconfig.temp.root
      },
      port: 3000,
      open: false,
      notify: false,
      middleware: compilePug
    });
  });




  gulp.task('dev:watch', ()=>{

    gulp.watch(`${zionconfig.src.pug}/**/*.pug`, gulp.parallel(function(done){
      browserSync.reload();
      done();
    }));

    gulp.watch(`${zionconfig.src.js}/**/*.js`, gulp.series('dev:js', (done) => {
      browserSync.reload();
      done();
    }));

    gulp.watch(`${zionconfig.src.scss}/**/*.scss`, gulp.series('dev:scss'));

  });




  gulp.task('dev', gulp.parallel('dev:assets', 'dev:npm' ,'dev:js', 'dev:scss', 'dev:serve', 'dev:watch'));

};



module.exports = new DevRegistry();
