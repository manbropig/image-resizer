module.exports = (function() {

  'use strict';

  let fs            = require('fs');
  let path          = require('path');
  let async         = require('async');
  let AWS           = require('aws-sdk');
  let util          = require('./util');

  AWS.config.region = 'us-west-1';

  let s3            = new AWS.S3();
  //bucket: migrated-thumbnails.thestorefront.com
  function Uploader(params) {
    this.targetDir            = params.targetDir;
    this.currentImages        = []; //array of files currently being uploaded
    this.uploadedImages       = [];
    this.chunkSize            = params.chunkSize;
    this.emitter              = params.eventEmitter;
    this.bucket               = params.bucket;
    this.destinationDirectory = '2016-01-27';
    this.cloudFrontURL        = 'd1ki1ikxja91di.cloudfront.net';
  }

  Uploader.prototype.beginUpload = function(files) {
    this.remainingImages = files;

    this.uploadCurrentChunk();
  };

  Uploader.prototype.getPhotoId = function(imageFile) {
    return path.parse(imageFile).name.split('_')[3];
  };

  Uploader.prototype.uploadCurrentChunk = function() {
    let _this = this;
    let uploadCount = 0;
    this.currentImages = util.getNextDataSet(this, 'remainingImages', 'uploadedImages', this.chunkSize);
    async.each(this.currentImages, function(image) {
      let imageFile = path.join(_this.targetDir, image);
      let fileParts   = path.parse(imageFile);
      let destination = path.join(_this.destinationDirectory, fileParts.base);

      let fileBody    = fs.createReadStream(imageFile);
      let s3obj       = new AWS.S3({params: {Bucket: _this.bucket, Key: destination, ContentType: 'image/jpeg'}});

      s3obj.upload({Body: fileBody}).send(function(err, data) {
        if (err) {
          util.logError(err, 'upload_errors.txt')
        } else {
          console.log(`${image} successfully uploaded`);
          let file = path.parse(data.Location).base;
          let url = path.join(_this.cloudFrontURL, _this.destinationDirectory, file);
          let csvLine = _this.getPhotoId(image) + ',' + url;

          util.writeLine(csvLine + '\n', 'data/output/uploaded_latest.csv');
          uploadCount++;

          if(uploadCount === _this.currentImages.length) {
            _this.emitter.emit('upload');
          }

        }
      });

    }, function(err) {
      if (err) {
        console.log(err);
      }
    });
  };

  return Uploader;

})();
