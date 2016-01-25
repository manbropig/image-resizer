module.exports = (function() {
  'use strict';

  var http = require('http');
  var fs = require('fs');
  var path = require('path');
  var validator = require('validator');
  var parse = require('csv-parse');

  function Downloader(params) {
    this.csvData = [];
    this.readData = [];
    this.emitter = params.eventEmitter;
    this.chunkSize = params.chunkSize;
    this.largeImageDir = params.outputDir;
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
          //TODO: fix - removing some good URLS - just check url exists?
          if (validator.isURL(url)) { //if there is a url

            _this.csvData.push({url: url, outputFile: getOutputFile(_this, lineItem)});

          } else {

            // console.log('invalid url: ' + url);

          }
        }
      });
    });

    lineReader.on('close', () => {
      _this.emitter.emit('csv read complete', _this.csvData);
    });
  };

  //split data into chunks of n
  Downloader.prototype.getNextDataSet = function(amount) {
    var amount = amount || this.chunkSize;
    var nextSet = this.csvData.splice(0, amount);

    this.readData = this.readData.concat(nextSet);

    return nextSet;
  };

  Downloader.prototype.handleReseponse = function(response, outputFile) {
    if (response.statusCode === 200) {
      var data = '';

      fs.open(outputFile, 'wx', (err, fd) => { //maybe open before http?

        var stream = fs.createWriteStream(outputFile);
        response.pipe(stream);
        response.on('end', () => {
          var outputFileString = outputFile.substr(outputFile.indexOf('listing_'));
          console.log(outputFileString + ' downloaded');
        });
      });

    }
  };

  Downloader.prototype.download = function() {
    var _this = this;
    var data = this.getNextDataSet(this.chunkSize);
    var requestCounter = 0;
    data.forEach( (datum, idx) => {
      var request = http.get(datum.url, (response) => {

        _this.handleReseponse(response, datum.outputFile)

        response.on('error', (e) => {

          console.log(`Got error: ${e.message}`);

        });

        response.on('end', () => {

          requestCounter++;

          if (requestCounter === data.length) {
            console.log('csvData length' ,_this.csvData.length);
            console.log('readData length' ,_this.readData.length);
            _this.emitter.emit('request set complete');

            if (_this.csvData.length === 0) {

              _this.emitter.emit('all images downloaded');

            }

          }
        });

      });
    });
  };

  Downloader.prototype.save = function(location) {

  };

  //private
  function getOutputFile(downloader, lineItem) {
    return path.join(__dirname, '..', '..', downloader.largeImageDir + '/listing_' + lineItem[2] + '_photo_' + lineItem[1] + '.' + lineItem[0].slice(-3))
  }

  return Downloader;
})();
