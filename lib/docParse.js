var Promise = require('bluebird');
var roster = require('./roster');
var stats = require('./stats');
var events = require('./events');
var gameInfo = require('./gameInfo');

module.exports = {
  parseRegularSeasonGame: parseRegularSeasonGame
};

//var season = '20142015';
//var gameId = '020171';

function parseRegularSeasonGame(season, gameId) {
	return parseGame(season, gameId, '02');
}

function parseGame(season, gameId, prefix) {

  var results = { };
  
  gameId = prefix + String('0000' + gameId).slice(-4);
 
  return Promise.resolve(results)
  .then(gameInfo(season, gameId))
  .then(roster(season, gameId))
  .then(stats(season, gameId))
  .then(events(season, gameId));

}
