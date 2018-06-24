// Todo: Update all paths


"use strict";

const path = require('path');
const gulp = require('gulp');
const fs   = require('fs');
const util = require('util');
const registry = require('undertaker-registry');
const zionconfig = require('../zionconfig');
const colors = require('colors');


function InitRegistry() {
  registry.call(this);
}
util.inherits(InitRegistry, registry);



InitRegistry.prototype.init = function(gulp) {

  gulp.task('init:scaffold', (done) => {

    const folders = [
      zionconfig.src.root,
      `${zionconfig.src.images}`,
      `${zionconfig.src.js}`,
      `${zionconfig.src.pug}`,
      `${zionconfig.src.scss}`
    ];

    folders.forEach(dir => {
        if(!fs.existsSync(dir))
            fs.mkdirSync(dir),
            console.log('📁  folder created:', dir);
    });

    done();
  });



  gulp.task('init:copy', done => {
    zionconfig.copy || (zionconfig.copy = []);

    let items = [...zionconfig.copy, ...[
      {
        from: path.resolve(__dirname+'/../.gitignore'),
        to: './'
      },
      {
        from: path.resolve(`node_modules/zion/${zionconfig.src.images}/**/*.*`),
        to: zionconfig.src.images
      },
      {
        from: path.resolve(`node_modules/zion/${zionconfig.src.pug}/**/*.*`),
        to: zionconfig.src.pug
      },
      {
        from: path.resolve(`node_modules/zion/${zionconfig.src.js}/**/*.*`),
        to: zionconfig.src.js
      },
      {
        from: path.resolve(`node_modules/zion/${zionconfig.src.scss}/style.scss`),
        to: zionconfig.src.scss
      },
    ]];

    
    console.log(`Coping items...`);

    // Todo: force overwrite

    const promise = items.map(function(item){
      return new Promise((resolve, reject) => {
        
        // if(fs.existsSync(item.to)){
        //   console.log(`⚠️  File already exists. Can not copy from: ${item.from}`.yellow);
        //   resolve();
        //   return;
        // }

        gulp.src(item.from, {overwrite:false})
          .pipe(gulp.dest(item.to))
          .on('end', err => {
            if (err) {
              console.log(err)
              reject(err);
            } else {
              console.log(`✅  ${item.from}`)
              resolve();
            }
          });
        });
    });
    return Promise.all(promise);

  });




  gulp.task('init', gulp.parallel('init:scaffold', 'init:copy'));


}
module.exports = new InitRegistry();
