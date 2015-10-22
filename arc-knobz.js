'use strict';

var _ = require('underscore');

// create a new stateful object that wraps an arc device
//
// 'device' is an arc device created by the monode npm lib
var Knboz = function(device){
  this.device = device;
  this.encoders = [];
  this.rings = [];
  this.dirty = []; // [[1, 3, 15], []] -- leds 1, 3,, 15 on rings[0] need to be updated

  for (let n = 0; n < device.size; n++){
    this.encoders[n] = 0; // position of encoder
    this.rings[n] = new Array(64).fill(0);
    this.dirty[n] = [];
  }

  // resolve leds
  setInterval(()=>{
    _.each(this.dirty, (dirtyRing, n)=>{
      _.each(dirtyRing, (pos)=>{
        this.device.level(n, pos, this.rings[n][pos]);
      });
    });
    this.dirty = [[], []];
  }, 2);


  device.on('enc', (n, delta)=>{
    var prevPos = this.encoders[n];
    this.encoders[n] = (((prevPos + delta) % 256) + 256) % 256; // positive modulo
    var newPos = this.encoders[n];

    this.led(n, Math.floor(prevPos * 0.25), 0);
    this.led(n, Math.floor(newPos * 0.25), 1);
  });

};



Knboz.prototype.level = function(n, pos, level){
  if (this.rings[n][pos] === level)
    return;

  this.rings[n][pos] = level;
  this.dirty[n].push(pos);
};

Knboz.prototype.led = function(n, pos, level){
  this.level(n, pos, level ? 15 : 0);
};

module.exports = Knboz;


