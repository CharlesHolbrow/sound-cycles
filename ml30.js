'use strict';
var repl = require('repl');

var osc = require('node-osc');
var _ = require('underscore');
var monode = require('monode')();
var PowerMate = require('node-powermate');

var rpp = require('./rpp-parse.js');
var Knboz = require('./arc-knobz.js');

////////////////////////////////////////////////////////////////
//
// Gather all data from our reaper session
//
////////////////////////////////////////////////////////////////

var jam = rpp.readFile('./indie-jam.rpp');

//var item = jam.TRACKs[1].ITEMs[1];
// var jam0 = jam.findItemsBySource('audio/Warm-up Jam U89 STEREO.wav');
// var jam1 = jam.findItemsBySource('audio/Jam 1 U89 STEREO.wav');
// var jam2 = jam.findItemsBySource('audio/Jam 2 U89 STEREO.wav');
//var matilda = jam.findItemsBySource('audio/Matilda.wav');
//var ml30 = jam.findItemsBySource('audio/ML30All.wav');


var ml30rpp = rpp.readFile('./ML30cuts.rpp');
var ml30SoftFilename = 'Media/soft.wav';
var ml30Soft = ml30rpp.findItemsBySource(ml30SoftFilename);

var ml30TransientFilename = 'Media/transient.wav';
var ml30Transient = ml30rpp.findItemsBySource(ml30TransientFilename);

var ml30CrazyFilename = 'Media/crazy.wav';
var ml30Crazy = ml30rpp.findItemsBySource(ml30CrazyFilename);


// Extract only the data what we are interested in, and put it
// in a tidy array of objects
var cleanData = function(data){

  data = _.map(data, (item)=>{
    return {
      position: item.POSITION[0],
      startInSource: item.SOFFS[0],
      length: item.LENGTH[0]
    };
  });

  data = _.sortBy(data, (data)=>{
    return data.startInSource;
  });
  return data;
}

// we have to send the data to Max via OSC, so we turn it all
// into arrays with properties in a known order
var makeArrays = function(data){
  return _(data).map((obj, i)=>{
    return [i, obj.startInSource, obj.position, obj.length];
  });
}

// var jam0DataArrays = makeArrays(cleanData(jam0));
// var matildaDataArrays = makeArrays(cleanData(matilda));
// var ml30DataArrays = makeArrays(cleanData(ml30));
var ml30SoftDataArrays = makeArrays(cleanData(ml30Soft));
//ml30SoftDataArrays.push([ml30SoftDataArrays.length, 5000, 5000, 10]);

var ml30TransientDataArrays = makeArrays(cleanData(ml30Transient));
//ml30TransientDataArrays.push([ml30TransientDataArrays.length, 5000, 5000, 10]);

var ml30CrazyDataArrays = makeArrays(cleanData(ml30Crazy));
//ml30CrazyDataArrays.push([ml30CrazyDataArrays.length, 5000, 5000, 10]);


console.log(ml30TransientDataArrays);

////////////////////////////////////////////////////////////////
//
// Ping max via osc
//
////////////////////////////////////////////////////////////////

var oscClient = new osc.Client('127.0.0.1', 9899);
_.each(ml30SoftDataArrays, (dataArray)=>{
  oscClient.send('/k1/position', dataArray);
});

_.each(ml30TransientDataArrays, (dataArray)=>{
  oscClient.send('/k3/position', dataArray);
});
_.each(ml30CrazyDataArrays, (dataArray)=>{
  oscClient.send('/k5/position', dataArray);
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
    var oscAddr = n === 1 ? '/k1/move' : '/k2/move';
    if (crossed.length){
      let amt = delta > 0 ? crossed.length : crossed.length * -1;
      oscClient.send(oscAddr, amt);
    }
  });

});

try {
  var pms = [new PowerMate(0), new PowerMate(1)];
  _.each(pms, function(pm, i){
    pm.on('wheelTurn', (delta)=>{
      var oscAddr = '/k' + (i + 3) + '/move';
      oscClient.send(oscAddr, delta);
    });
  });

} catch(error){
  console.log(error);
}
