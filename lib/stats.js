var cheerio = require('cheerio');
var getDocument = require('./util/getDocument');
var _ = require('lodash');


// Order we find stats in
var STAT_NAMES = [
  'goals',
  'assists',
  'points',
  'plusMinus',
  'penalties',
  'penaltyMinutes',
  'timeOnIce',
  'numberOfShifts',
  'averageShift',
  'powerPlayTimeOnIce',
  'shortHandedTimeOnIce',
  'evenStrengthTimeOnIce',
  'shots',
  'shotAttemptsBlocked',
  'missedShots',
  'hits',
  'giveaways',
  'takeaways',
  'blockedShots',
  'faceoffsWon',
  'faceoffsLost',
  'faceoffPercentage'
];

module.exports = function(season, gameId) {

  return function(result) {

    return getDocument(season, gameIdentifier(gameId))
    .then(cheerio.load)
    .then(function($) {

      var stats = { };

      _.each(result.rosters, function(players, teamName) {
        addStats(players, teamName, stats, $);
      });

      result.stats = stats;

      return result;

    });

  };


};

function gameIdentifier(gameId) {
  return 'ES' + gameId;
}

function findStatsForTeam($, team) {

  // Find something that resembles the team table, which is the last time
  // the team's name is mentioned. Don't include TEAM TOTALS row
  return $('table tr td table tr td:contains("' + team + '")').last().parent().next('tr').nextUntil('tr:contains("TEAM TOTALS")');

}

function addStats(players, teamName, stats, $) {

  var NUMBER_INDEX = 0;
  var POSITION_INDEX = 1;
  var STATS_INDEX = 3;

  // We want to create a "key" for players since different sheets do
  // names differently (for example, here is LAST, FIRST.
  // Key based on number|position, and use this to find name.
  var mappedPlayers = _.reduce(players, function(result, player) {
    result[keyForNumberAndPosition(player.number, player.position)] = player.name;
    return result;
  }, {});

  var playerStats = { };

  // For every row for this team
  findStatsForTeam($, teamName).each(function(index, row) {

    // Get the player's name from our format (FIRST LAST)
    row = $(row);
    var number = row.children('td').eq(NUMBER_INDEX).text().trim();
    var position = row.children('td').eq(POSITION_INDEX).text().trim();
    var name = mappedPlayers[keyForNumberAndPosition(number, position)];
    playerStats[name] = { };

    // Start at the beginning of the stats, look up what stat we are at
    // in our above array
    cheerio(row).children('td').slice(STATS_INDEX).each(function(index, cell) {

      //TODO - better handling of numbers
      playerStats[name][STAT_NAMES[index]] = cheerio(cell).text().trim() || '0';

    });
  });

  stats[teamName] = playerStats;

}

function keyForNumberAndPosition(number, position) {
  return number + '|' + position;
}
