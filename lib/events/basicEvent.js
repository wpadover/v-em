var _ = require('lodash');
var cheerio = require('cheerio');


function parseBasicEvent(row, gameUtil) {

  return {
    period: period(row),
    evenStrength: isEvenStrength(row),
    timeElapsed: timeElapsed(row),
    gameTime: gameTime(row),
    playersOnIce: playersOnIce(row, gameUtil)
  };

}


function timeElapsed(row) {

  var TIME_ELAPSED_INDEX = 0;
  var TIME_CELL = 3;

  var times = row.eq(TIME_CELL).html().split('<br>');

  return times[TIME_ELAPSED_INDEX];
}


function gameTime(row) {

  var TIME_CELL = 3;
  var GAME_TIME_INDEX = 1;

  var times = row.eq(TIME_CELL).html().split('<br>');

  return times[GAME_TIME_INDEX];
}


function isEvenStrength(row) {

  var STRENGTH_CELL = 2;

  var strength = row.eq(STRENGTH_CELL).text();

  // If strength is SH or PP
  return !_.contains(['SH', 'PP'], (strength || '').trim());
}


function period(row) {

  var PERIOD_CELL = 1;
  //TODO - Playoff games? Other OTs?
  var PERIODS = [
    '1',
    '2',
    '3',
    'OT',
    'SO'
  ];

  return PERIODS[parseInt(row.eq(PERIOD_CELL).text().trim())-1];
}


function playersOnIce(row, gameUtil) {

  var AWAY_ON_ICE_CELL = 6;
  var HOME_ON_ICE_CELL = 7;

  var players = {};
  players[gameUtil.homeTeam] = playersOnIceForTeam(row.eq(HOME_ON_ICE_CELL),
    gameUtil.homeAbbreviation, gameUtil);
  players[gameUtil.awayTeam] = playersOnIceForTeam(row.eq(AWAY_ON_ICE_CELL),
    gameUtil.awayAbbreviation, gameUtil);

  return players;

}


function playersOnIceForTeam(cell, teamAbbreviation, gameUtil) {

  var players = [];

  var playersCells = cell.children('table').children('tr').children('td').filter(function(index, elem) {
    //Remove blank cells
    return !!(cheerio(elem).text().trim());
  });

  playersCells.each(function (i, playerCell) {
    players.push(gameUtil.findPlayer(teamAbbreviation,
      [cheerio(playerCell).find('td').first().text()]));
  });

  return players;

}



module.exports = exports = parseBasicEvent;
