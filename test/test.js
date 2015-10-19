assert = require('assert');
rpp = require('../rpp-parse.js');

console.log('blahasdf', rpp);

describe('parseLine', function(){

  it('should parse a single word into an array with a single value', function(){
    assert.deepEqual(rpp.parseLine('WORD'), ['WORD']);
  });

  it('should parse values delimited by spaces', function(){
    assert.deepEqual(rpp.parseLine('LINE 1 2 3'), ['LINE',1,'2',3]);
  });

  it('could convert numbers to typeof number', function(){
    var res = rpp.parseLine('LINE 1 2 3')
    assert.equal(typeof res[1], 'number');
  });

  it('should handle strings in quotes', function(){
    var res = rpp.parseLine('"ok" blah `last`');
    assert.deepEqual(res, ['"ok"', 'blah', '`last`']);
  });

  it('should fail ignore trailing space', function(){
    var res = rpp.parseLine("WORD ok ", ['WORD', 'ok']);
  });


});
