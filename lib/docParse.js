var util = require('util');
var roster = require('./roster');
var stats = require('./stats');
var events = require('./events');
var gameInfo = require('./gameInfo');

module.exports = parse;

var parse = function() {

  var results = { };

  return gameInfo('./test_data/events.html', results)
  .then(function() { 
    return roster('./test_data/roster.html', results)
  })
  .then(function() {
    return stats('./test_data/stats.html', results);
  })
  .then(function() {
    return events('./test_data/events.html', results);
  })
  .return(results);

};

//TEMPORARY FOR TESTING
parse().then(function (data) {
  console.log(JSON.stringify(data, null, 4));
});
