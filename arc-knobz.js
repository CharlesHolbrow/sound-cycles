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
        var level = this.rings[n][pos];
        level = level > 15 ? 15 : level;
        level = level < 0  ? 0  : level;
        this.device.level(n, pos, level);
      });
    });
    this.dirty = [[], []];
  }, 5);

  // initialize
  _.each(this.encoders, (encoder, n)=>{
    this.add(n, 0, 15)
  });

  // update led when we turn the encoder
  device.on('enc', (n, delta)=>{
    var prevPos = this.encoders[n];
    this.encoders[n] = (((prevPos + delta) % 256) + 256) % 256; // positive modulo
    var newPos = this.encoders[n];

    var prevLed = Math.floor(prevPos * 0.25);
    var newLed = Math.floor(newPos * 0.25);

    this.add(n, prevLed, -15);
    this.add(n, newLed, 15);


    var moveBy = newLed - prevLed;
    moveBy = moveBy > 32 ? moveBy - 64 : moveBy;
    moveBy = moveBy < -32 ? moveBy + 64 : moveBy;
    if (moveBy)
      device.emit('move', n, moveBy, prevLed, newLed);

  });

};

Knboz.prototype.add = function(n, pos, amt){
  var current = this.rings[n][pos];
  this.level(n, pos, current + Math.floor(amt));
}

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


