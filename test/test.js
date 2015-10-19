assert = require('assert');
rpp = require('../rpp-parse.js');

console.log('blahasdf', rpp);

describe('parseLine', function(){

  it('should parse a single word into an array with a single value', function(){
    assert.deepEqual(rpp.parseLine('WORD'), ['WORD']);
  });

  it('should parse ints delimited by spaces', function(){
    assert.deepEqual(rpp.parseLine('LINE 1 2 3'), ['LINE',1,2,3]);
  });

});

assert.ok(rpp, 'import successful');
