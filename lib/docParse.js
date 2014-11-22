var Promise = require('bluebird');
var roster = require('./roster');
var stats = require('./stats');
var events = require('./events');
var gameInfo = require('./gameInfo');

module.exports = {
  parseGame: parseGame
};

//var season = '20142015';
//var gameId = '020171';
function parseGame(season, gameId) {

  var results = { };

  return Promise.resolve(results)
  .then(gameInfo(season, gameId))
  .then(roster(season, gameId))
  .then(stats(season, gameId))
  .then(events(season, gameId));

}
