"use strict";

let Downloader   = require('./app/components/downloader');
let EventEmitter = require('events');
let async        = require('async');
let util         = require('./app/components/util');
let inputCSVFile = 'data/image_urls_test.csv';

(function() {
  let emitter = new EventEmitter();
  let downloader = new Downloader({eventEmitter: emitter, chunkSize: 20, outputDir: 'large_images'});

  downloader.readCSV(inputCSVFile);

  emitter.on('download', (options) => {
    if (options && options.complete) {
      console.log('images in chunk downloaded');
    }
    downloader.download();
  });

  emitter.on('all images downloaded', () => {
    console.log('* All images downloaded *');
    console.log('Begin to resize all images...');
  });

})();
