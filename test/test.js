assert = require('assert');
fs = require('fs');
rpp = require('../rpp-parse.js');


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

  it('should ignore trailing space', function(){
    assert.deepEqual(rpp.parseLine("WORD ok  "), ['WORD', 'ok']);
    assert.deepEqual(rpp.parseLine("WORD 'ok'  "), ['WORD', "'ok'"]);
  });

  it('should ignore leading whitespace', ()=>{
    assert.deepEqual(rpp.parseLine("  WORD ok"), ['WORD', 'ok']);
    assert.deepEqual(rpp.parseLine('  "WORD" ok'), ['"WORD"', 'ok']);
  });

});

t0 = "BAD START\n\
<RECORD_CFG\n\
  ZXZhdxAA\n\
>"

t1 = "<RECORD_CFG\n\
  VALUE\n\
>"

t2 = '<REAPER_PROJECT 0.1 "5.04/OSX64" 1445270847\n\
  RIPPLE 2\n\
  okay 1 2 3\n\
  then 3 4 5\n\
  VALUE\n\
>'


describe('parseBlock', function(){

  it('should reject any block that does not start with a "<" char', function(){
    assert.throws(
      function(){rpp.parseBlock(t0)}, 
      Error,
      'did not throw'
    );
  });

  it('should handle a simple object', ()=>{
    var obj = rpp.parseBlock(t1);
    console.log(obj);
    assert.equal(typeof obj['RECORD_CFG'], 'object');
    assert.ok('VALUE' in obj['RECORD_CFG']);
  });

  it('should handle another obj', ()=>{
    var obj = rpp.parseBlock(t2);
    assert.deepEqual(obj.REAPER_PROJECT.okay, [1, 2, 3]);
    console.log('t2:', obj);
  })
});

data = fs.readFileSync('./test/test.rpp', 'ascii');
// parsed = rpp.parseBlock(data);