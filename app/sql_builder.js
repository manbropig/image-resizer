"use strict";

let fs = require('fs');
let path = require('path');

let file = 'uploaded.csv';
let lines = [];

let lineReader = require('readline').createInterface({
  input: fs.createReadStream(file)
});

lineReader.on('line', (line) => {
  let parts = line.split(',');
  let sqlLine = `(${parts[0]}, '//${parts[1]}')`;
  lines.push(sqlLine);
});

lineReader.on('close', () => {
  let values = lines.join(',');

  let stmt = `
  update listing_photos as lp
  set thumbnail_url = d.thumbnail_url
  from (values ${values})
  as d(id, thumbnail_url)
  where d.id = lp.id;`;


  console.log(stmt);
});
