var util = require('util');
var roster = require('./roster');

module.exports = parse;

var parse = function() {

  var result = { };

  return roster('./test_data/roster.html')
  .then(function(players) {
    result.players = players;
    return result;
  });

};

//TEMPORARY FOR TESTING
parse().then(function (data) {
  console.log(JSON.stringify(data, null, 4));
});
