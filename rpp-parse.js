var rpp = {};
module.exports = rpp;
delimiterRegex = / (['`"])?/;

rpp.parseLine = function(lineText, array){
  array = array || [];

  var match = lineText.match(delimiterRegex);

  if (!match){
    // There are no more delimiters
    // Add entire string to array
    array.push(lineText);
    return array;
  }

  // position of the space
  var delimiterPosition = match.index;
  var delimiter = lineText[delimiterPosition];

  if (delimiter == ' '){
    var part = lineText.slice(0, delimiterPosition)
    var rest = lineText.slice(delimiterPosition - lineText.length + 1);
    array.push(part)

    return rpp.parseLine(rest, array);
  }

};


rpp.load = function(filename){

};


rpp.parse = function(rppText){

};
