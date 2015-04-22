var cheerio = require('cheerio');
var getDocument = require('./util/getDocument');
var _ = require('lodash');
var Promise = require('bluebird');


// Order we find stats in
var STATS = [
  {
    name: 'goals',
    postProcessor: parseInt
  },
  {
    name: 'assists',
    postProcessor: parseInt
  },
  {
    name: 'points',
    postProcessor: parseInt
  },
  {
    name: 'plusMinus',
    postProcessor: parseInt
  },
  {
    name: 'penalties',
    postProcessor: parseInt
  },
  {
    name: 'penaltyMinutes',
    postProcessor: parseInt
  },
  {
    name: 'timeOnIce'
  },
  {
    name: 'numberOfShifts'
  },
  {
    name: 'averageShift'
  },
  {
    name: 'powerPlayTimeOnIce'
  },
  {
    name: 'shortHandedTimeOnIce'
  },
  {
    name: 'evenStrengthTimeOnIce'
  },
  {
    name: 'shots',
    postProcessor: parseInt
  },
  {
    name: 'shotAttemptsBlocked',
    postProcessor: parseInt
  },
  {
    name: 'missedShots',
    postProcessor: parseInt
  },
  {
    name: 'hits',
    postProcessor: parseInt
  },
  {
    name: 'giveaways',
    postProcessor: parseInt
  },
  {
    name: 'takeaways',
    postProcessor: parseInt
  },
  {
    name: 'blockedShots',
    postProcessor: parseInt
  },
  {
    name: 'faceoffsWon',
    postProcessor: parseInt
  },
  {
    name: 'faceoffsLost',
    postProcessor: parseInt
  },
  {
    name: 'faceoffPercentage',
    postProcessor: parseInt
  }
];

module.exports = function(gameInfoP, rosterP, season, gameId) {

  var stats = { };

  return Promise.join(gameInfoP, rosterP, getDocument(season, gameIdentifier(gameId)),
    function(gameInfo, rosters, doc) {
      var $ = cheerio.load(doc);

      _.each(rosters, function(players, teamName) {
        addStats(players, teamName, stats, $);
      });

      return stats;

    }
  );

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

      var stat = cheerio(cell).text().trim() || '0';
      if (STATS[index].hasOwnProperty('postProcessor')) {
        stat = STATS[index].postProcessor(stat);
      }
      playerStats[name][STATS[index].name] = stat;

    });
  });

  stats[teamName] = playerStats;

}

function keyForNumberAndPosition(number, position) {
  return number + '|' + position;
}
