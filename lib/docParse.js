var Promise = require('bluebird');
var parseRoster = require('./roster');
var parseStats = require('./stats');
var parseEvents = require('./events');
var parseGameInfo = require('./gameInfo');

module.exports = {
  parseRegularSeasonGame: parseRegularSeasonGame
};

//var season = '20142015';
//var gameId = '020171';

function parseRegularSeasonGame(season, gameId) {
	return parseGame(season, gameId, '02');
}

function parseGame(season, gameId, prefix) {

  gameId = prefix + String('0000' + gameId).slice(-4);

  var gameInfo = parseGameInfo(season, gameId);
  var roster = parseRoster(season, gameId);
  var stats = parseStats(gameInfo, roster, season, gameId);
  var events = parseEvents(gameInfo, roster, season, gameId);

  return Promise.join(gameInfo, roster, stats, events, function(gameInfo, roster, stats, events) {
    return {
      gameInfo: gameInfo,
      rosters: roster,
      stats: stats,
      events: events
    };
  });

}
