'use strict';
var _ = require('underscore');
var monode = require('monode')();

var rpp = require('./rpp-parse.js');
var jam = rpp.readFile('./indie-jam.rpp');
var Knboz = require('./arc-knobz.js');

var item = jam.TRACKs[1].ITEMs[1];

var jam0 = jam.findItemsBySource('Ringside - JamSessionOutputs\\Warm-up Jam U89 STEREO.wav');
var jam1 = jam.findItemsBySource('Ringside - JamSessionOutputs\\Jam 1 U89 STEREO.wav');
var jam2 = jam.findItemsBySource('Ringside - JamSessionOutputs\\Jam 2 U89 STEREO.wav');

var jam0Data = _.map(jam0, (item)=>{
  return {
    startInSource: item.SOFFS[0],
    length: item.LENGTH[0]
  };
});

jam0Data = _.sortBy(jam0Data, (data)=>{
  return data.startInSource;
});

console.log(jam0Data);

var knobz;

monode.on('device', (device)=>{
  if (!device.isArc)
    return;
  knobz = new Knboz(device);
});
