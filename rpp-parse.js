var rpp = {};
module.exports = rpp;
delimiterRegex = /[ '`"]/;

rpp.parseLine = function(lineText, array){
  array = array || [];

  var delimiterPosition = lineText.search(delimiterRegex);

  if (delimiterPosition == -1){
    // there are no more delimiters, just throw the rest onto the array
    array.push(lineText);
    return array;
  }
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
