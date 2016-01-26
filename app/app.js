"use strict";

let Downloader   = require('./components/downloader');
let util         = require('./components/util');
let EventEmitter = require('events');
let async        = require('async');
let inputCSVFile = 'data/image_urls_test.csv';

(function() {
  let emitter = new EventEmitter();
  let downloader = new Downloader({eventEmitter: emitter, chunkSize: 50, outputDir: 'large_images'});

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
