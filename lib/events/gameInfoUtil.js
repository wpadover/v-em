var _ = require('lodash');
// Class to be used to story necessary game info that
// all the events need to use to parse data
// e.g. Rosters, abbreviations

function GameInfoUtil(gameInfo, rosters) {

  this.homeTeam = gameInfo.homeTeam.name;
  this.homeAbbreviation = gameInfo.homeTeam.abbreviation;

  this.awayTeam = gameInfo.awayTeam.name;
  this.awayAbbreviation = gameInfo.awayTeam.abbreviation;


  this.rosters = rosters;

  // Create map of:
  // ABBREVIATION ->
  //                  NUM -> PLAYER NAME
  this.mappedRosters = this.mapRoster();

  // Map of:
  // ABBREVIATION -> TEAM NAME
  this.TEAM_NAME_MAP = this.buildTeamNameMap();

  this.ZONE_MAP = {
    'Off. Zone' : 'offensive',
    'Def. Zone' : 'defensive',
    'Neu. Zone' : 'neutral'
  };

}

GameInfoUtil.prototype = {

  mapRoster: function() {

    var rosters = {};
    rosters[this.homeAbbreviation] = this.mapRosterForTeam(this.homeTeam);
    rosters[this.awayAbbreviation] = this.mapRosterForTeam(this.awayTeam);

    return rosters;

  },

  mapRosterForTeam: function(teamName) {

    return _.reduce(this.rosters[teamName], function(mappedRoster, playerObj) {
      mappedRoster[playerObj.number] = playerObj.name;
      return mappedRoster;
    }, {});

  },

  translateZone: function(zone) {
    return this.ZONE_MAP[zone];
  },

  buildTeamNameMap: function() {
    var map = {};
    map[this.homeAbbreviation] = this.homeTeam;
    map[this.awayAbbreviation] = this.awayTeam;
    return map;
  },

  findPlayer: function(teamAbbreviation, number) {
    return this.mappedRosters[teamAbbreviation][number];
  },

  teamForAbbreviation: function(teamAbbreviation) {
    return this.TEAM_NAME_MAP[teamAbbreviation];
  }

};

module.exports = exports = GameInfoUtil;
