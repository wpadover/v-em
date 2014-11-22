var Promise = require('bluebird');
var roster = require('./roster');
var stats = require('./stats');
var events = require('./events');
var gameInfo = require('./gameInfo');

module.exports = parse;

var parse = function() {

  var results = { };

  var season = '20142015';
  var gameId = '020171';

  return Promise.resolve(results)
  .then(gameInfo(season, gameId))
  .then(roster(season, gameId))
  .then(stats(season, gameId))
  .then(events(season, gameId));

};

//TEMPORARY FOR TESTING
parse().then(function (data) {
  console.log(JSON.stringify(data, null, 4));
});
