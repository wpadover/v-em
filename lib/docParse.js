var Promise = require('bluebird');
var util = require('util');
var roster = require('./roster');
var stats = require('./stats');
var events = require('./events');
var gameInfo = require('./gameInfo');

module.exports = parse;

var parse = function() {

  var results = { };

  return Promise.resolve(results)
  .then(gameInfo('./test_data/events.html'))
  .then(roster('./test_data/roster.html'))
  .then(stats('./test_data/stats.html'))
  .then(events('./test_data/events.html'));

};

//TEMPORARY FOR TESTING
parse().then(function (data) {
  console.log(JSON.stringify(data, null, 4));
});
