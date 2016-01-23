module.exports = (function() {
  'use strict';

  var http = require('http');
  var fs = require('fs');
  var path = require('path');
  var validator = require('validator');
  var parse = require('csv-parse');

  function Downloader() {}

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
            });;
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
  }

  Downloader.prototype.download = function(url) {

  };

  Downloader.prototype.save = function(location) {

  };

  //private
  function getOutputFile(lineItem) {
    return path.join(__dirname, '..', '..', 'output/listing_' + lineItem[2] + '_photo_' + lineItem[1] + '.' + lineItem[0].slice(-3))
  }

  return Downloader;
})();
