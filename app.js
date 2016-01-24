#!/usr/bin/env node

'use strict';
var Resizer = require('./app/components/resizer');
var Downloader = require('./app/components/downloader');
var EventEmitter = require('events');
var async = require('async');
var inputCSVFile = 'data/image_urls.csv';
// var Buffer = require('bugger');

(function() {
  var emitter = new EventEmitter();
  //init tools
  var resizer = new Resizer();
  var downloader = new Downloader(emitter, 5);

  //collect urls from a csv
  //keep track of listing_id association
  // downloader.parse(inputCSVFile);
  downloader.readCSV(inputCSVFile);
  emitter.on('csv read complete', () => {
    async.waterfall([
      (callback) => {
        //NOTE: here instead call downloader.download or something which calls
        //getNextData, downloads all the images in the set,
        //then emits a 'send next data set' event
        //or 'done' event if done
        downloader.download();

      }
    ])
  });


  emitter.on('request set complete', () => {
    console.log('first complete');
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
