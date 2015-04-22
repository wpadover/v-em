var Promise = require('bluebird');
var parseRoster = require('./roster');
var parseStats = require('./stats');
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

  var rostersP = parseRoster(season, gameId);
  var gameInfoP = parseGameInfo(rostersP, season, gameId);
  var statsP = parseStats(gameInfoP, rostersP, season, gameId);

  return Promise.join(gameInfoP, rostersP, statsP, function(gameInfo, rosters, stats) {
    return {
      gameInfo: gameInfo.basicInfo,
      rosters: rosters,
      stats: stats,
      events: gameInfo.events
    };
  });

}
