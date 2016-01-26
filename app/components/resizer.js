module.exports = (function() {

  'use strict';

  var fs = require('fs');

  function Resizer(params) {
    this.sharp = require('sharp');
    this.largeImages = params.files;
    this.currentImages = []; //array of files currently being processed
    this.resizedImages = [];
    this.chunkSize = params.chunkSize;
  }

  Resizer.prototype.setDestination = function(destinationFile) {
    this.destination = destinationFile;
    return this;
  };

  Resizer.prototype.setInput = function(input) {
    this.input = input;
    return this;
  };

  Resizer.prototype.setWidth = function(width) {
    this.width = width || 240;
    return this;
  };

  Resizer.prototype.resize = function(callback) {
    this.sharp(this.input)
    .resize(this.width, null)
    .toFormat('jpeg')
    .toBuffer(callback);
  };

  Resizer.prototype.processImage = function(inputFile, outputFile, width) {
    var self = this;
    self
    .setInput('/Users/jamie/Desktop/test.jpg')
    .setDestination('output.jpg')
    .setWidth(240)
    .resize(function(err, buffer, info) {
      if (err) {
        console.log(err);
        return;
      }

      fs.writeFile(self.destination, buffer, function() {
        console.log('complete');
      });

    });
  };

  // Resizer.prototype.getNextDataSet = function(amount) {
  //   var amount = amount || this.chunkSize;
  //   this.currentImages = this.largeImages.splice(0, amount);
  //
  //   return this;
  // };


  return Resizer;

})();
