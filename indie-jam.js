'use strict';
var repl = require('repl');

var osc = require('node-osc');
var _ = require('underscore');
var monode = require('monode')();

var rpp = require('./rpp-parse.js');

////////////////////////////////////////////////////////////////
//
// Gather all data from our reaper session
//
////////////////////////////////////////////////////////////////

var jam = rpp.readFile('./indie-jam.rpp');
var Knboz = require('./arc-knobz.js');

var item = jam.TRACKs[1].ITEMs[1];

var jam0 = jam.findItemsBySource('audio/Warm-up Jam U89 STEREO.wav');
var jam1 = jam.findItemsBySource('audio/Jam 1 U89 STEREO.wav');
var jam2 = jam.findItemsBySource('audio/Jam 2 U89 STEREO.wav');

var jam0Data = _.map(jam0, (item)=>{
  return {
    position: item.POSITION[0],
    startInSource: item.SOFFS[0],
    length: item.LENGTH[0]
  };
});

jam0Data = _.sortBy(jam0Data, (data)=>{
  return data.startInSource;
});

var jam0DataArrays = _(jam0Data).map((obj, i)=>{
  return [i, obj.startInSource, obj.position, obj.length];
});


////////////////////////////////////////////////////////////////
//
// Ping max viz osc
//
////////////////////////////////////////////////////////////////

var oscClient = new osc.Client('127.0.0.1', 9899);
oscClient.send('/load', 'audio/Warm-up Jam U89 STEREO.wav');
_.each(jam0DataArrays, (dataArray)=>{
  oscClient.send('/position', dataArray);
});


////////////////////////////////////////////////////////////////
//
// Arc setup
//
////////////////////////////////////////////////////////////////
monode.on('device', (device)=>{
  if (!device.isArc)
    return;

  device.on('disconnect', ()=>{
    console.log('close device');
    device.close();
  });

  // clear all leds
  for (let n = 0; n < device.size; n++){
    device.osc.send(device.prefix + '/ring/all', n, 0);
  }

  var knobz = new Knboz(device);
  global.knobz = knobz;

  // delimit the regions that we will sample at
  var divisions = [];
  var divisionCount = 16;
  for (let i = 0; i < divisionCount; i++){
    let pos = Math.floor(64 / divisionCount * i);
    divisions.push(pos);
  }

  // call add on all delimiting positions;
  knobz.divAdd = function(n, amt){
    _.each(divisions, (pos)=>{
      knobz.add(n, pos, amt);
    });
  }

  knobz.divFlash = function(n){
    var power = 10;
    knobz.divAdd(n, power);
    for (let i = 0; i < power; i ++){
      setTimeout(()=>{
        knobz.divAdd(n, -1);
      }, 100 * i);

    }
  };

  // illuminate the positions
  for (let n = 0; n < 2; n++){
    knobz.divAdd(n, 1);
  }

  device.on('move', (n, delta, oldPos, newPos)=>{
    // list the positions that we are interested in
    var direction = delta > 0 ? 1 : -1;
    var check = oldPos;
    var end = newPos;
    var positions = [];
    do {
      check += direction; // don't check the pos we started on
      check = ((check % 64) + 64) % 64;
      positions.push(check);
    } while (check !== end);

    var crossed = _.intersection(positions, divisions);
    if (crossed.length){
      let amt = delta > 0 ? crossed.length : crossed.length * -1;
      oscClient.send('/move', amt);
    }
  });

});

// repl.start({useGlobal:true});
