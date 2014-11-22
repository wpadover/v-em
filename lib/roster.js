var cheerio = require('cheerio');
var getDocument = require('./util/getDocument');

var TEAM_LOCATOR = 'td.teamHeading';


module.exports = function(season, gameId) {

  return function parseRoster(result) {

    //TODO - get dynamically
    return getDocument(season, gameIdentifier(gameId))
    .then(cheerio.load)
    .then(function($) {

      result.rosters = { };

      var awayTeamName = findAwayTeamName($);
      var homeTeamName = findHomeTeamName($);

      var awayTeam = [ ];
      var homeTeam = [ ];

      // 5th match is the away roster, 6th is home roster. Skip the first row, which is a header
      var awayRoster = findAwayRoster($);
      var homeRoster = findHomeRoster($);

      addPlayers(awayTeam, awayRoster);
      addPlayers(homeTeam, homeRoster);

      result.rosters[awayTeamName] = awayTeam;
      result.rosters[homeTeamName] = homeTeam;

      return result;

    });
  };
};

function gameIdentifier(gameId) {
  return 'RO' + gameId;
}

function findAwayTeamName($) {
  return $(TEAM_LOCATOR).first().text();
}

function findHomeTeamName($) {
  return $(TEAM_LOCATOR).last().text();
}

function findAwayRoster($) {
  var AWAY_TEAM_TABLE_NUMBER = 5;
  return findRoster($, AWAY_TEAM_TABLE_NUMBER);
}

function findHomeRoster($) {
  var HOME_TEAM_TABLE_NUMBER = 6;
  return findRoster($, HOME_TEAM_TABLE_NUMBER);
}

function findRoster($, tableNumber) {
  var ROSTER_LOCATOR = 'body table tr td table tr td table tr td table';
  return $(ROSTER_LOCATOR).eq(tableNumber).children('tr').next();
}

function addPlayers(team, elements) {

  var NUMBER_CELL = 0;
  var POSITION_CELL = 1;
  var NAME_CELL = 2;

  var PLAYER_REGEX = /([A-Za-z\s.]+)\s*(\(C\))?(\(A\))?/;
  var NAME_GROUP = 1;
  var CAPTAIN_GROUP = 2;
  var ALTERNATE_CAPTAIN_GROUP = 3;


  elements.each(function(i, elem) {
    elem = cheerio(elem);
    var nameMatch = PLAYER_REGEX.exec(elem.children('td').eq(NAME_CELL).text());
    team.push({
      number: elem.children('td').eq(NUMBER_CELL).text(),
      position: elem.children('td').eq(POSITION_CELL).text(),
      name: nameMatch[NAME_GROUP].trim(),
      captain: nameMatch[CAPTAIN_GROUP] ? true : undefined,
      alternateCaptain: nameMatch[ALTERNATE_CAPTAIN_GROUP] ? true : undefined,
    });
  });

}
