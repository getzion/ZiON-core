"use strict";

const path = require('path');
const gulp = require('gulp');
const fs   = require('fs');
const util = require('util');
const registry = require('undertaker-registry');


function InitRegistry() {
  registry.call(this);
}
util.inherits(InitRegistry, registry);

InitRegistry.prototype.init = function(gulp) {
  gulp.task('init:folders', ()=>{
    //Todo: make folders dynamically
    const folders = [
      'src',
      'src/fonts',
      'src/images',
      'src/js',
      'src/pug',
      'src/scss',
      'src/lib'
    ];

    folders.forEach(dir => {
        if(!fs.existsSync(dir))
            fs.mkdirSync(dir),
            console.log('📁  folder created:', dir);
    });
  });
}
module.exports = new InitRegistry();
