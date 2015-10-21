'use strict';

var _ = require('underscore');

// create a new stateful object that wraps an arc device
//
// 'device' is an arc device created by the monode npm lib
var Knboz = function(device){
  this.device = device;
  this.encoders = [];
  for (let i = 0; i < device.size; i++){
    this.encoders[i] = {
      pos: 0,
      led: 0
    }
  }

  // resolve every 20 ms
  setInterval(()=>{

    // clear all rings
    _.each(this.encoders, (enc, n)=>{
      device.osc.send(device.prefix + '/ring/all', n, 0);
    });

    // pause a moment and re-light the leds
    setTimeout(()=>{
      _.each(this.encoders, (enc, n)=>{
        var led = Math.floor(enc.pos * 0.25);
        device.led(n, led, 1);
      });
    }, 2);
  }, 20);


  device.on('enc', (n, delta)=>{
    var enc = this.encoders[n];
    // positive modulo
    enc.pos = (((enc.pos + delta) % 256) + 256) % 256;
  });

};

module.exports = Knboz;


