module.exports = (function() {
  'use strict';

  var http = require('http');
  var fs = require('fs');
  var path = require('path');
  var validator = require('validator');
  var parse = require('csv-parse');

  function Downloader(eventEmitter, chunkSize) {
    this.csvData = [];
    this.readData = [];
    this.emitter = eventEmitter;
    this.chunkSize = chunkSize;
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

            _this.csvData.push({url: url, outputFile: getOutputFile(lineItem)});

          } else {

            // console.log('invalid url: ' + url);

          }
        }
      });
    });

    lineReader.on('close', function() {
      _this.emitter.emit('csv read complete', _this.csvData);
    });
  };
  //split data into chunks of n
  Downloader.prototype.getNextDataSet = function(amount) {
    // var start = nextIndex - _this.readData.length;
    // var end = (this.csvData.length < start + 10) ? start + 10 : this.csvData.length - start;
    // var currentData = this.csvData.slice(start, end);
    // _this.readData.concat(currentData);

    var nextSet = this.csvData.splice(0, amount);
    console.log(nextSet);
    this.readData.concat(nextSet);
    return nextSet;
  };

  //TODO: now use the array instead of the whole file - loop 20 at a time
  Downloader.prototype.parse = function(file) {
    var _this = this;

    var lineReader = require('readline').createInterface({
      input: fs.createReadStream(file)
    });

    console.log('Beginning CSV parsing...');
    lineReader.on('line', (line) => { //read one line at a time

      parse(line, (err, items) => {
        if (err) {
          console.log(line);
          console.log(err)
        } else {

          var lineItem = items[0] || [];
          var url = 'http:' + lineItem[0];

          if (validator.isURL(url)) { //if there is a url

            var outputFile = getOutputFile(lineItem);
            var request = http.get(url, (response) => {

              _this.handleReseponse(response, outputFile)

            }).on('error', (e) => {

              console.log(`Got error: ${e.message}`);

            });
          }
          else {

            console.log('invalid url: ' + url);

          }
        }
      });

    });
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
            //somecounter++ until somecounter === data.length, THEN emit 'send data'
            requestCounter++;
            console.log(requestCounter, data.length);
            if (requestCounter === data.length) {

                _this.emitter.emit('request set complete');

            }
        });

      });
    });
  };

  Downloader.prototype.save = function(location) {

  };

  //private
  function getOutputFile(lineItem) {
    return path.join(__dirname, '..', '..', 'output/listing_' + lineItem[2] + '_photo_' + lineItem[1] + '.' + lineItem[0].slice(-3))
  }

  return Downloader;
})();
