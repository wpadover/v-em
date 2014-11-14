var Promise = require('bluebird');
var cheerio = require('cheerio');
var readFile = require('../util/readFile');
var _ = require('lodash');

const GOAL_TR_CHILD = 1;
const DATE_TR_CHILD = 3;

module.exports = function(file, result) {

  result.gameInfo = {};

  return readFile(file)
  .then(cheerio.load)
  .then(function($) {
    buildGameInfo($, result.gameInfo );
  });

};

function buildGameInfo( obj, gameInfo )
{
    gameInfo.awayTeam = buildTeamInfo(obj('table#Visitor'));
    gameInfo.homeTeam = buildTeamInfo(obj('table#Home'));

    gameInfo.date = obj('table#GameInfo').children('tr').eq(DATE_TR_CHILD).text();
}

function buildTeamInfo( objTable )
{
	return {
		name : objTable.children('tr').last().children('td').html().split('<br>')[0],
		goals : objTable.children('tr').eq(GOAL_TR_CHILD).children('td').text()
	};
}