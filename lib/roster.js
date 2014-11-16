var Promise = require('bluebird');
var cheerio = require('cheerio');
var readFile = require('../util/readFile');

const ROSTER_LOCATOR = 'body table tr td table tr td table tr td table';
const TEAM_LOCATOR = 'td.teamHeading';

const AWAY_TEAM_TABLE_NUMBER = 5;
const HOME_TEAM_TABLE_NUMBER = 6;

const NUMBER_CELL = 0;
const POSITION_CELL = 1;
const NAME_CELL = 2;

const PLAYER_REGEX = /([A-Za-z\s.]+)\s*(\(C\))?(\(A\))?/;
const NAME_GROUP = 1;
const CAPTAIN_GROUP = 2;
const ALTERNATE_CAPTAIN_GROUP = 3;

module.exports = function(file) {

  return function(result) {

    //TODO - get dynamically
    return readFile(file)
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

function findAwayTeamName($) {
  return $(TEAM_LOCATOR).first().text();
}

function findHomeTeamName($) {
  return $(TEAM_LOCATOR).last().text();
}

function findAwayRoster($) {
  return findRoster($, AWAY_TEAM_TABLE_NUMBER);
}

function findHomeRoster($) {
  return findRoster($, HOME_TEAM_TABLE_NUMBER);
}

function findRoster($, tableNumber) {
  return $(ROSTER_LOCATOR).eq(tableNumber).children('tr').next();
}

function addPlayers(team, elements) {

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
