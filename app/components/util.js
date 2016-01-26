"use strict";

module.exports = {

  getNextDataSet: function(me, source, dest, amt) {
    let amount = amt || me.chunkSize;
    let nextSet = me[source].splice(0, amount);

    me[dest] = me[dest].concat(nextSet);
    return nextSet;
  }
};

return module.exports;
