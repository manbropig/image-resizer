"use strict";

let path         = require('path');
let fs           = require('fs');
let EventEmitter = require('events');
let _            = require('underscore');
let Uploader     = require('./components/uploader');

(function() {

  let emitter = new EventEmitter();
  let initialFileCount = 0;

  let uploader = new Uploader({
    bucket: 'migrated-thumbnails.thestorefront.com',
    eventEmitter: emitter,
    chunkSize: 100,
    targetDir: 'data/new_thumbnails'
  });

  fs.readdir(uploader.targetDir, (err, files) => { //get all file from output directory
    if (err) {
      console.log(err);
    } else {
      let dstore = files.indexOf('.DS_Store');
      if (dstore !== -1) {
        files.splice(dstore, 1);
      }

      uploader.beginUpload(files);

    }
  });

  emitter.on('upload', function() {
    console.log(`${uploader.uploadedImages.length} images uploaded`);
    uploader.uploadCurrentChunk();
  });

})();
