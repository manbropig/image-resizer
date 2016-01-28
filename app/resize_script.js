"use strict";

let Resizer      = require('./components/resizer');
let EventEmitter = require('events');
let async        = require('async');
let util         = require('./components/util');
let _            = require('underscore');

(function() {

  let fs = require('fs');
  let emitter = new EventEmitter();

  let resizer = new Resizer({
    chunkSize: 50,
    eventEmitter: emitter,
    targetDir: 'data/new_large_images',
    width: 120
  });

  fs.readdir(resizer.largeImageDir, (err, files) => { //get all file from output directory
    if (err) {
      console.log(err);
    } else {
      let dstore = files.indexOf('.DS_Store')
      if (dstore !== -1) {
        files.splice(dstore, 1);
      }

      fs.readdir(resizer.resizedDir, (err, resizedFiles) => {
        let stillLarge = _.difference(files, resizedFiles);
        console.log(`files: ${files.length}, resized: ${resizedFiles.length}, remaining: ${stillLarge.length}`);
        resizer.setImages(stillLarge);
        resizer.resizeNextChunk();
      })

    }
  });

 emitter.on('chunk resized', function() {
   resizer.resizeNextChunk();
 });

})();
