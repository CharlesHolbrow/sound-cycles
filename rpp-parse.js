var rpp = {};
module.exports = rpp;

spaceRegex = /^([^'`"][^ ]*)\s?/;
delimiterRegex = /^((['`"])(?:.*?)(?:\2))\s?(.*)/;
numberRegex = /^-?(\d+(.\d+)?)$/

rpp.parseLine = function(lineText){
  array = [];

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
};


rpp.load = function(filename){

};


rpp.parse = function(rppText){

};
