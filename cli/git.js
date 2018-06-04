"use strict";

const gulp = require('gulp');
const git = require('gulp-git');
const util = require('util');
const registry = require('undertaker-registry');
const bump = require('gulp-bump');
let argv = require('yargs').argv;


function gitRegistry() {
  registry.call(this);
}
util.inherits(gitRegistry, registry);

gitRegistry.prototype.init = (gulp) => {

  // Run git commit
  // src are the files to commit (or ./*)
  gulp.task('git:commit', () => {
    let commitMessage = argv.m || 'Life is too to write a commit message!';
    return gulp.src('./')
      .pipe(git.add())
      .pipe(git.commit(commitMessage));

  });

  // Run git push
  // remote is the remote repo
  // branch is the remote branch to push to
  gulp.task('git:push', () => {
    git.push('origin', 'master', function (err) {
      if (err) throw err;
    });
  });

  gulp.task('git', gulp.series('git:commit', 'git:push'));

}
module.exports = new gitRegistry();
