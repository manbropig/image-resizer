module.exports = (function() {
  'use strict';

  var http = require('http');
  var fs = require('fs');
  var parse = require('csv-parse');
  function Downloader() {

  }

  Downloader.prototype.parse = function(file) {
    var _this = this;
    var lineReader = require('readline').createInterface({
      input: fs.createReadStream(file)
    });

    lineReader.on('line', function(line) {

      parse(line, function(err, items) {
        var lineItem = items[0];

        if (lineItem[0]) { //if there is a url
          var photoId = lineItem[1];
          var listingId = lineItem[2];
          var extension = lineItem[0].slice(-3); //get last 3 chars
          var url = 'http:' + lineItem[0];

          var request = http.get(url, function(response) {
            var data = '';
            var outputFile = __dirname + '../data/listing_' + listingId + '_photo_' + photoId + '.' + extension;
            console.log(outputFile);
            response.on('data', function(chunk) {
              data += chunk;
            });

            response.on('end', function() {
              //once a response is complete for a file
              // fs.write(outputFile, data, function(err, written) {
              //   console.log(written + ' bytes written to ' + outputFile);
              // });
            });
          });
        }
      });

    });
  };

  Downloader.prototype.download = function(url) {

  };

  Downloader.prototype.save = function(location) {

  };

  return Downloader;
})();
