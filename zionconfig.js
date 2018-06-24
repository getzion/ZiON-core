"use strict";

const path = require('path');
const fs   = require('fs');
const colors = require('colors');


let getZionconfig = () => {
    const configCore = JSON.parse(fs.readFileSync(path.resolve(__dirname+'/zionconfig.json')))
    let configUser = {};

    if(fs.existsSync('./zionconfig.json')){
      try {
          configUser = JSON.parse(fs.readFileSync('./zionconfig.json'));
      } catch(e) {
          console.log('⚠️  zionconfig.json is empty or has SyntaxError.'.yellow); // error in the above string (in this case, yes)!
      }
    }

    return {...configCore, ...configUser};
}

module.exports = getZionconfig();
