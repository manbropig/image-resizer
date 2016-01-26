module.exports = (function() {
  'use strict';

  var http      = require('http');
  var fs        = require('fs');
  var path      = require('path');
  var validator = require('validator');
  var parse     = require('csv-parse');
  var async     = require('async');
  var util      = require('./util');

  function Downloader(params) {
    this.csvData = [];
    this.readData = [];
    this.emitter = params.eventEmitter;
    this.chunkSize = params.chunkSize;
    this.largeImageDir = params.outputDir;
    this.totalImageCount = 0;
    this.downloadedImageCount = 0; //keep track of images already downloaded
  }

  Downloader.prototype.readCSV = function(file) {
    var _this = this;
    var lineReader = require('readline').createInterface({
      input: fs.createReadStream(file)
    });

    console.log('Collecting CSV data...');

    lineReader.on('line', (line) => { //read one line at a time
      parse(line, (err, items) => {
        if (err) {
          console.log(line);
          console.log(err)
        } else {

          var lineItem = items[0] || [];
          var url = 'http:' + lineItem[0];

          if (lineItem[0]) { //if there is a url

            _this.csvData.push({url: url, outputFile: getOutputFile(_this, lineItem)});

          } else {
            // var errorMessage = 'invalid url for photo: ' + lineItem[1] + ' listing: ' + lineItem[2] + '\n';
            // console.log(errorMessage);
            // fs.appendFile('errors.txt', errorMessage, function(err) {
            //   if (err) {
            //     console.log(err);
            //   }
            // });
          }
        }
      });
    });

    lineReader.on('close', () => {
      _this.totalImageCount = _this.csvData.length;
      _this.emitter.emit('download', _this.csvData);
    });
  };

  Downloader.prototype.handleReseponse = function(response, datum, dataLength) {
    if (response.statusCode === 200) {
      var data = '';

      fs.open(datum.outputFile, 'wx', (err, fd) => {
        var stream = fs.createWriteStream(datum.outputFile);
        response.pipe(stream);
      });

    } else { //error case
      let errorMessage = `Got status code ${response.statusCode} for when trying to download ${datum.outputFile}\n`;
      console.log(errorMessage);
      fs.appendFile('errors.txt', errorMessage, function(err) {
        if (err) {
          console.log(err);
        }
      });
      let _this = this;
      _this.requestCounter++;
      _this.endResponse(new Error(), dataLength, datum);
    }
  };

  Downloader.prototype.endResponse = function(error, length, datum) {
    let _this = this;
    var outputFileString = datum.outputFile.substr(datum.outputFile.indexOf('listing_'));

    if (!error) {
      console.log(outputFileString + ' downloaded');
    }

    // console.log('reqs: ', _this.requestCounter, ' | length: ', length);
    if (_this.requestCounter === length) {
      console.log('csvData length',  _this.csvData.length);
      console.log('readData length', _this.readData.length);

      _this.emitter.emit('download', {complete: true});
      _this.downloadedImageCount += _this.requestCounter;

      if (_this.downloadedImageCount === _this.totalImageCount) {

        _this.emitter.emit('all images downloaded');

      }
    }
  };

  //TODO: try async.each here?
  Downloader.prototype.download = function() {
    var _this = this;
    var data = util.getNextDataSet(_this, 'csvData', 'readData');
    _this.requestCounter = 0; //TODO: remove this from function signatures
    async.each(data, (datum) => {
      var request = http.get(datum.url, (response) => {

        _this.handleReseponse(response, datum, data.length);

        response.on('end', () => {
          _this.requestCounter++;
          _this.endResponse(null, data.length, datum);

        });

      });
    }, (err) => {
      if (err) {
        console.log(err);
      }
    });
  };

  //private
  function getOutputFile(downloader, lineItem) {
    let extension = path.parse(lineItem[0]).ext.toLowerCase();
    return path.join(__dirname, '..', '..', downloader.largeImageDir + '/listing_' + lineItem[2] + '_photo_' + lineItem[1] + extension);
  }

  return Downloader;
})();
