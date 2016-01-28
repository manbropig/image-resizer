"use strict";

let fs = require ('fs');

module.exports = {

  getNextDataSet: function(me, source, dest, amt) {
    let amount = amt || me.chunkSize;
    let nextSet = me[source].splice(0, amount);

    me[dest] = me[dest].concat(nextSet);
    return nextSet;
  },


  logError: function(errorMessage, file, callback) {
    fs.appendFile(file, errorMessage, function(err) {
      if (err) {
        console.log(err);
      }
      if(typeof callback === 'function') {
        callback();
      }
    });
  },

  writeLine: function(line, file, callback) {
    fs.appendFile(file, line, function(err) {
      if (err) {
        console.log(err);
      }
      if(typeof callback === 'function') {
        callback();
      }
    });
  }

}

  return module.exports;
