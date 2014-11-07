var Promise = require('bluebird');
var cheerio = require('cheerio');
var fs = Promise.promisifyAll(require("fs"));

var ROSTER_LOCATOR = 'body table tr td table tr td table tr td table';
var TEAM_LOCATOR = 'td.teamHeading';

var ROAD_TEAM_TABLE_NUMBER = 5;
var HOME_TEAM_TABLE_NUMBER = 6;

var NUMBER_CELL = 0;
var POSITION_CELL = 1;
var NAME_CELL = 2;

var PLAYER_REGEX = /([A-Za-z\s.]+)\s*(\(C\))?(\(A\))?/;
var NAME_GROUP = 1;
var CAPTAIN_GROUP = 2;
var ALTERNATE_CAPTAIN_GROUP = 3;

module.exports = function(file) {

  //TODO - get dynamically
  return fs.readFileAsync(file, "utf8")
  .then(removeNewLines)
  .then(cheerio.load)
  .then(function($) {

    var result = { };

    var awayTeamName = $(TEAM_LOCATOR).first().text();
    var homeTeamName = $(TEAM_LOCATOR).last().text();

    var awayTeam = [ ];
    var homeTeam = [ ];

    // 5th match is the away roster, 6th is home roster. Skip the first row, which is a header
    var awayRoster = $(ROSTER_LOCATOR).eq(ROAD_TEAM_TABLE_NUMBER).children('tr').next();
    var homeRoster = $(ROSTER_LOCATOR).eq(HOME_TEAM_TABLE_NUMBER).children('tr').next();

    addPlayers(awayTeam, awayRoster);
    addPlayers(homeTeam, homeRoster);

    result[awayTeamName] = awayTeam;
    result[homeTeamName] = homeTeam;

    return result;

  });
};

function removeNewLines(text) {
  return text.replace(/(\r\n|\n|\r)/gm,"");
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
