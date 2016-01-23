#!/usr/bin/env node

'use strict';
var Resizer = require('./app/components/resizer');
var Downloader = require('./app/components/downloader');

// var Buffer = require('bugger');

(function() {
  //init tools
  var resizer = new Resizer();
  var downloader = new Downloader();

  //collect urls from a csv
  //keep track of listing_id association
  downloader.parse('data/image_urls_test.csv');
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
