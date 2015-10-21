'use strict';
var _ = require('underscore');

var rpp = require('./rpp-parse.js');
var jam = rpp.readFile('./indie-jam.rpp');

var item = jam.TRACKs[1].ITEMs[1];

var jam0 = jam.findItemsBySource('Ringside - JamSessionOutputs\\Warm-up Jam U89 STEREO.wav');
var jam1 = jam.findItemsBySource('Ringside - JamSessionOutputs\\Jam 1 U89 STEREO.wav');
var jam2 = jam.findItemsBySource('Ringside - JamSessionOutputs\\Jam 2 U89 STEREO.wav');

var jam0Times = _.map(jam0, (item)=>{
  return [item.SOFFS[0], item.LENGTH[0]];
});
console.log(jam0Times);
