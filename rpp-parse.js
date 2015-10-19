'use strict';

var rpp = {};
module.exports = rpp;

var spaceRegex = /^([^'`"][^ ]*)\s?/;
var delimiterRegex = /^((['`"])(?:.*?)(?:\2))\s?(.*)/;
var numberRegex = /^-?(\d+(.\d+)?)$/
var trimLeadingTrailingWhitespace = /^\s+|\s+$/g

rpp.parseLine = function(lineText){
  lineText = lineText.replace(trimLeadingTrailingWhitespace, '');
  var array = [];

  while (lineText.length){
    var match = lineText.match(delimiterRegex) || lineText.match(spaceRegex);
    var part = match[1];
    // part.length +1: (+1 is for the space)
    var lineText = lineText.slice(part.length + 1, lineText.length);
    array.push(numberRegex.test(part) ? parseFloat(part) : part);
  }

  return array;
};

rpp.parseBlock = function(blockText){
  if (blockText[0] !== '<') 
    throw new Error('Text does not begin with "<"');

  var lines = blockText.split(/\n|\r/);
  var result = {parent:null};
  var target = result;
  var position = 0;

  while (position < lines.length) {
    let parsedLine = rpp.parseLine(lines[position]);
    if (parsedLine[0][0] === '<'){
      parsedLine[0] = parsedLine[0].slice(1);
      let newObject = {parent:target};
      target[parsedLine[0]] = newObject; // the name of the object
      target = newObject;
    }

    if (parsedLine[0] === '>'){
      target = target.parent
    } else {
      var name = parsedLine[0];
      var args = parsedLine.slice(1);
      target[name] = args;
    }

    position++;
  }

  return result;
};


rpp.load = function(filename){

};


rpp.parse = function(rppText){

};
