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

var t0 = "BAD START\n\
<RECORD_CFG\n\
  ZXZhdxAA\n\
>";

var t1 = "<RECORD_CFG\n\
  VALUE\n\
>";

var t2 = "<REAPER_PROJECT 0.1 '5.04/OSX64' 1445270847\n\
  RIPPLE 2\n\
  okay 1 2 3\n\
  then 3 4 5\n\
  <OTHER\n\
    TWO 2\n\
  >\n\
  VALUE\n\
>";

var multiple = "<PROJ\n\
  TRACK 1 2 3\n\
  TRACK 4 5 6\n\
  <TRACK\n\
    THIS IS SOME OTHER STUFF\n\
  >\n\
  <TRACK TWO\n\
    this is some stuff lower\n\
  >\n\
  <TRACK\n\
    this is some stuff lower\n\
  >\n\
>"


describe('parseBlock', function(){

  it('should put duplicates in a lower case version with the same name', ()=>{
    obj = rpp.parseBlock(multiple);
    assert.equal(obj.PROJ.TRACKs.length, 3);
  });

  it('should reject any block that does not start with a "<" char', function(){
    assert.throws(
      function(){rpp.parseBlock(t0)}, 
      Error,
      'did not throw'
    );
  });

  it('should handle a simple object', ()=>{
    var obj = rpp.parseBlock(t1);
    assert.equal(typeof obj['RECORD_CFG'], 'object');
    assert.ok('VALUE' in obj['RECORD_CFG']);
  });

  it('should handle another obj', ()=>{
    var obj = rpp.parseBlock(t2);
    assert.deepEqual(obj.REAPER_PROJECT.okay, [1, 2, 3]);
    assert.deepEqual(obj.REAPER_PROJECT.OTHER.TWO, [2]);
  });

  it('should run on an actual file without crashing', ()=>{
    var data = fs.readFileSync('./test/test.rpp', 'ascii');
    var parsed = rpp.parseBlock(data);
  });
});
