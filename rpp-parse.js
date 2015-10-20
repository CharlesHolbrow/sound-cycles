'use strict';
var fs = require('fs');

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

  var lines = blockText.split(/\r?\n/);
  var result = {parent:null};
  var target = result;
  var position = 0;

  while (position < lines.length) {
    let parsedLine = rpp.parseLine(lines[position]);

    if (parsedLine[0] && parsedLine[0][0] === '<'){
      // we are starting a new group. cut off the opening '<''
      parsedLine[0] = parsedLine[0].slice(1);
      let name = parsedLine[0];
      let newObject = {parent:target};
      // where do we put the object?
      // check if we already have an array of these
      if (newObject.parent.hasOwnProperty(name+'s')){
        newObject.parent[name+'s'].push(newObject)
      }
      // check if we need to create a collection
      else if (newObject.parent.hasOwnProperty(name)){
        newObject.parent[name+'s'] = [newObject.parent[name], newObject];
        delete newObject.parent[name];
      }
      else {
        target[name] = newObject; // the name of the object
      }
      // Until we reach a '>', put all lines inside the object
      // we just created.
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

rpp.readFile = function(filename){
  var data = fs.readFileSync(filename, 'ascii');
  return rpp.parseBlock(data);
};
