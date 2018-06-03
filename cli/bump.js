"use strict";

const gulp = require('gulp');
const bump = require('gulp-bump');
const util = require('util');
const registry = require('undertaker-registry');
let argv = require('yargs').argv;



function bumpRegistry() {
  registry.call(this);
}
util.inherits(bumpRegistry, registry);

bumpRegistry.prototype.init = function(gulp) {

  // Will patch the version
  gulp.task('bump', ()=>{
    console.log("Todo: auto version bump");
  });

}
module.exports = new bumpRegistry();
