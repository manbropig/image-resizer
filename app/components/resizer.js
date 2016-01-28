module.exports = (function() {

  'use strict';

  let fs    = require('fs');
  let path  = require('path');
  let util  = require('./util');
  let async = require('async');

  function Resizer(params) {
    this.sharp = require('sharp');
    this.currentImages = []; //array of files currently being processed
    this.resizedImages = [];
    this.chunkSize = params.chunkSize;
    this.emitter = params.eventEmitter;
    this.resizedDir = 'data/new_thumbnails';
    this.width = params.width || 240;
    this.largeImageDir = params.targetDir;
  }

  Resizer.prototype.resizeNextChunk = function(callback) {
    let _this = this;
    //take first chunk of files
    _this.currentImages = util.getNextDataSet(_this, 'largeImages', 'resizedImages', this.chunkSize);

    if (_this.currentImages.length) { //resize the chunk and save to a directory

      async.each(_this.currentImages, function(inputFile, callback) {
        _this.processImage(inputFile, callback);
      }, function(err) {
        if (err) {
          console.log(err);
        }
        _this.emitter.emit('chunk resized'); //after all images have been processed
      });

    }
  };

  Resizer.prototype.convertNextChunk = function(callback) {
    let _this = this;
    //take first chunk of files
    _this.currentImages = util.getNextDataSet(_this, 'largeImages', 'resizedImages', this.chunkSize);

    if (_this.currentImages.length) { //resize the chunk and save to a directory

      async.each(_this.currentImages, function(inputFile, callback) {
        _this.convertImage(inputFile, callback);
      }, function(err) {
        if (err) {
          console.log(err);
        }
        _this.emitter.emit('chunk resized'); //after all images have been processed
      });

    } else {
      //done
    } //end if

    //emit signal to pass in next chunk
    //when all images have been resized, call calback()
  };

  Resizer.prototype.setImages = function(files) {
    this.largeImages = files;
  };


  Resizer.prototype.getDestination = function(inputFile) {
    let pieces = path.parse(inputFile);

    // return path.join(this.resizedDir, pieces.name + pieces.ext);
    return path.join(this.resizedDir, pieces.name + '.jpeg');
  };

  Resizer.prototype.getInputFile = function(inputFile) {
    let pieces = path.parse(inputFile);

    return path.join(this.largeImageDir, pieces.name + pieces.ext);
  };

  Resizer.prototype.getWidth = function() {
    return this.width;
  };

  Resizer.prototype.getExtension = function(input) {
    // let ext = path.parse(input).ext.substr(1); //remove the '.'
    // return {'jpeg': 'jpeg', 'jpg' : 'jpeg','png' : 'png', 'gif': 'gif'}[ext.toLowerCase()];
    return 'jpeg';
  };

  Resizer.prototype.resize = function(params, callback) {
    try {
      this.sharp(params.inputFile)
      .resize(params.width, null)
      .toFormat('jpeg')
      .toBuffer(callback);
    } catch(e) {
      var errorMessage = `Bad image ${params.inputFile} or bad extension: ${params.ext}`;
      console.log(errorMessage);
      fs.appendFile('resize_errors.txt', errorMessage, function(err) {
        if (err) {
          console.log(err);
        }
        callback();
      });

    }
  };

  Resizer.prototype.processImage = function(inputFile, callback) {
    var _this = this;
    let params = {
      inputFile: _this.getInputFile(inputFile),
      // ext: _this.getExtension(inputFile),
      destination: _this.getDestination(inputFile),
      width: _this.getWidth(),
    };

    _this.resize(params, function(err, buffer, info) {
      if (err) {
        console.log(err);
        return;
      }
      fs.writeFile(params.destination, buffer, function() {
        console.log('resized ', params.destination);
        //remove element from array after it's been resized
        _this.currentImages.splice(_this.currentImages.indexOf(inputFile), 1);
        callback();
      });

    });
  };

  return Resizer;

})();
