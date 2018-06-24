"use strict";

// Making error reporting beautiful
require('pretty-error').start();

const glob = require('glob');
const path = require('path');
const Liftoff = require('liftoff');
const gulp = require('gulp');
const colors = require('colors');
const browserSync = require('browser-sync').create();




// ----------------------------------------------
//  Importing tasks dynamically and
//  Registering with gulp registry
//  https://github.com/gulpjs/gulp/blob/4.0/docs/API.md#gulpregistryregistry
// ----------------------------------------------

const importTasks = (folder)=>{
  glob.sync(folder).forEach( function( file ) {
    gulp.registry(require(path.resolve(file)));
  });
}

//Importing from zion-core cli
importTasks(path.resolve(__dirname+'/cli/**/*.js'));

// Importing from current working directory
if(path.resolve('./') != __dirname){
  importTasks('./cli/**/*.js');
}

// Todo
// Importing from users cli extensions
//






// ----------------------------------------------
//    The CLI
// ----------------------------------------------


// Default arguments
let argv = require('yargs')
  .option('version', {
    alias: 'v',
    describe: 'Show ZiON version number'
  })
  .option('help', {
    alias: 'h',
    describe: 'Show help'
  })
  .argv;


// Passing arguments dynamically as gulp tasks
let handleArguments = env=>{

  // console.log(argv);

  argv._.length || (argv._ = ['dev']);
  argv._.forEach(taskName=>{
    if(gulp.task(taskName) == undefined){
      console.log('Eror: Task `'.red + taskName.bold.red +'` does not exists!'.red)
      process.exit(1);
    }
  })

  gulp.series(argv._)();

}



// Launching the actual CLI
const cli = new Liftoff({name: 'zion'});
let run = ()=>{
  cli.launch(
    {
      cwd: process.cwd(),
      // Todo: what to add and why?
      // configPath: argv.zionfile,
      // require: argv.require,
      // completion: argv.completion,
      // verbose: argv.verbose
    },
    handleArguments
  );
}

// Catching all those nasty errors
process.on('uncaughtException', (error) =>{
  console.log(error)
} )

module.exports = run;