module.exports = (function() {

  'use strict';

  var fs = require('fs');

  function Resizer() {
    this.sharp = require('sharp');
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

  return Resizer;

})();
