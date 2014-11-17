var cheerio = require('cheerio');
var readFile = require('./util/readFile');

var TEAM_TABLES = {
  HOME : {
    tableName: 'table#Home',
    abbreviationIndex: 1,
  },
  AWAY : {
    tableName: 'table#Visitor',
    abbreviationIndex: 0,
  }
};

var GOAL_TR_CHILD = 1;
var DATE_TR_CHILD = 3;

module.exports = function(file) {

  return function parseGameInfo(result) {

    result.gameInfo = {};

    return readFile(file)
    .then(cheerio.load)
    .then(function($) {
      buildGameInfo($, result.gameInfo );
    })
    .return(result);
  };

};

function buildGameInfo( obj, gameInfo ) {
  gameInfo.awayTeam = buildTeamInfo(obj, TEAM_TABLES.AWAY);
  gameInfo.homeTeam = buildTeamInfo(obj, TEAM_TABLES.HOME);

  gameInfo.date = obj('table#GameInfo').children('tr').eq(DATE_TR_CHILD).text();
}

function buildTeamInfo( objTable, teamTable ) {
  var table = objTable(teamTable.tableName);
	return {
		name : buildTeamName(table),
    abbreviation : buildAbbreviation(objTable, teamTable.abbreviationIndex),
		goals : buildGoals(table),
	};
}

function buildTeamName(table) {
  return table.children('tr').last().children('td').html().split('<br>')[0];
}

function buildAbbreviation(objTable, index) {
  return objTable('td:contains("On Ice")').eq(index).text().split(' On Ice')[0];
}

function buildGoals(table) {
  return table.children('tr').eq(GOAL_TR_CHILD).children('td').text();
}
