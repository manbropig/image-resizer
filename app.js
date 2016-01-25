#!/usr/bin/env node

'use strict';
let Resizer = require('./app/components/resizer');
let Downloader = require('./app/components/downloader');
let EventEmitter = require('events');
let async = require('async');
let inputCSVFile = 'data/image_urls_test.csv';

(function() {
  let emitter = new EventEmitter();
  let downloader = new Downloader({eventEmitter: emitter, chunkSize: 1, outputDir: 'output'});

  downloader.readCSV(inputCSVFile);

  emitter.on('csv read complete', () => {

    downloader.download();

  });

  emitter.on('request set complete', () => {

    console.log('set complete');
    downloader.download();

  });

  emitter.on('all images downloaded', () => {

    console.log('Begin to resize all images...');

    async.waterfall([
      (callback) => {
        //resize all images here
        let fs = require('fs');
        fs.readdir('output', (err, files) => {
          if (err) {
            console.log(err);
          }

          let resizer = new Resizer({files: files, chunkSize: 5});
          console.log(files);
          resizer.getNextDataSet();
          console.log('current image set: \n', resizer.currentImages);
        });

      },

    ]);
  });


  // async.waterfall([
  //   function(callback) {
  //     //first read all lines of the file
  //     downloader.readCSV(inputCSVFile, function() {
  //       callback(null, downloader.csvData);
  //     });
  //
  //   },
  //   function(csvData, callback) {
  //
  //     console.log(csvData.length);
  //
  //   },
  //
  // ]);

  //download images based on urls
  //once a file is downloaded, emit event with file location

  //when a file is downloaded, resize it

  //RESIZE INDIVIDUAL IMAGE
  var inputFile = '/Users/jamie/Desktop/test.jpg';
  var outputFile = 'output.jpg';
  // resizer.processImage(inputFile, outputFile, 240);

  //when a file is done being resized, upload to s3

  //when upload complete, get thumbnail_url

  //update db with thumbnail_url

})();
