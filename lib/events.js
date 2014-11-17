var Promise = require('bluebird');
var cheerio = require('cheerio');
var readFile = require('../util/readFile');
var _ = require('lodash');

const PERIOD_CELL = 1;
const STRENGTH_CELL = 2;
const TIME_CELL = 3;
const EVENT_CELL = 4;
const DESCRIPTION_CELL = 5;
const AWAY_ON_ICE_CELL = 6;
const HOME_ON_ICE_CELL = 7;

const TIME_ELAPSED_INDEX = 0;
const GAME_TIME_INDEX = 1;

//TODO - Playoff games? Other OTs?
const PERIODS = [
  '1',
  '2',
  '3',
  'OT',
  'SO'
];

module.exports = function(file) {

  return function(results) {

    results.events = [];

    return readFile(file)
    .then(cheerio.load)
    .then(function($) {

      var eventTransformer = new EventTransformer(results);

      allEvents($).each(function(i, e) {
        results.events.push(eventTransformer.buildEvent(cheerio(e)));
      });

      return results;

    });

  };

};

function allEvents($) {
  return $('tr.evenColor');
}


function EventTransformer(results) {
  this.results = results;

  this.homeTeam = this.results.gameInfo.homeTeam.name;
  this.homeAbbreviation = this.results.gameInfo.homeTeam.abbreviation;
  this.awayTeam = this.results.gameInfo.awayTeam.name;

  this.awayAbbreviation = this.results.gameInfo.awayTeam.abbreviation;
  this.mappedRosters = this.mapRoster();

  this.EVENT_MAP = {
    'PSTR': this.parsePeriodStart,
    'FAC': this.parseFaceoff,
    'HIT': this.parseHit,
    'SHOT': this.parseShot,
    'STOP': this.parseStop,
    'GIVE': this.parseGiveaway,
    'BLOCK': this.parseBlock,
    'TAKE': this.parseTakeaway,
    'MISS': this.parseMissedShot,
    'PENL': this.parsePenalty,
    'GOAL': this.parseGoal,
    'PEND': this.parsePeriodEnd,
    'SOC': this.parseShootoutComplete,
    'GEND': this.parseGameEnd
  };

  this.ZONE_MAP = {
    'Off. Zone' : 'offensive',
    'Def. Zone' : 'defensive',
    'Neu. Zone' : 'neutral'
  };

  this.TEAM_NAME_MAP = this.buildTeamNameMap();

}

EventTransformer.prototype = {

  buildEvent: function (e) {
    var thisEvent = {};

    var row = e.children('td');

    thisEvent.period = this.period(row);
    thisEvent.evenStrength = this.isEvenStrength(row);
    thisEvent.timeElapsed = this.timeElapsed(row);
    thisEvent.gameTime = this.gameTime(row);
    thisEvent.playersOnIce = this.playersOnIce(row);

    var parsedEventType = this.eventType(row);
    var rowText = row.eq(DESCRIPTION_CELL).text().trim();

    if (this.EVENT_MAP.hasOwnProperty(parsedEventType)) {
      var boundFn = this.EVENT_MAP[parsedEventType].bind(this);
      return _.merge(thisEvent, boundFn(rowText));
    } else {
      console.log('Found unrecognized event type: ' + parsedEventType);
      return thisEvent;
    }
  },

  buildTeamNameMap: function()
  {
    var map = {};
    map[this.homeAbbreviation] = this.homeTeam;
    map[this.awayAbbreviation] = this.awayTeam;
    return map;
  },

  mapRoster: function() {

    var rosters = {};
    rosters[this.homeAbbreviation] = this.mapRosterForTeam(this.homeTeam);
    rosters[this.awayAbbreviation] = this.mapRosterForTeam(this.awayTeam);

    return rosters;

  },

  mapRosterForTeam: function(teamName) {

    return _.reduce(this.results.rosters[teamName], function(mappedRoster, playerObj) {
      mappedRoster[playerObj.number] = playerObj.name;
      return mappedRoster;
    }, {});

  },

  findPlayer: function(teamAbbreviation, number) {
    return this.mappedRosters[teamAbbreviation][number];
  },

  playersOnIce: function(row) {

    var players = {};
    players[this.homeTeam] = this.playersOnIceForTeam(row.eq(HOME_ON_ICE_CELL),
      this.mappedRosters[this.homeAbbreviation]);
    players[this.awayTeam] = this.playersOnIceForTeam(row.eq(AWAY_ON_ICE_CELL),
      this.mappedRosters[this.awayAbbreviation]);

    return players;

  },

  playersOnIceForTeam: function(cell, teamRoster) {

    var players = [];

    var playersCells = cell.children('table').children('tr').children('td').filter(function(index, elem) {
      //Remove blank cells
      return !!(cheerio(elem).text().trim());
    });

    playersCells.each(function (i, playerCell) {
      players.push(teamRoster[cheerio(playerCell).find('td').first().text()]);
    });

    return players;

  },

  eventType: function(row) {
    return row.eq(EVENT_CELL).text().trim();
  },

  period: function(row) {
    return PERIODS[parseInt(row.eq(PERIOD_CELL).text().trim())-1];
  },

  timeElapsed: function(row) {
    var times = row.eq(TIME_CELL).html().split('<br>');
    return times[TIME_ELAPSED_INDEX];
  },

  gameTime: function(row) {
    var times = row.eq(TIME_CELL).html().split('<br>');
    return times[GAME_TIME_INDEX];
  },

  isEvenStrength: function(row) {

    var strength = row.eq(STRENGTH_CELL).text();

    // If strength is SH or PP
    return !_.contains(['SH', 'PP'], (strength || '').trim());
  },

  parsePeriodStart: function() {
    return {
      'type': 'periodStart'
    };
  },

  //NYR won Def. Zone - STL #12 LEHTERA vs NYR #16 BRASSARD
  parseFaceoff: function(rowText) {
    //(TEAM) won .... - (TEAM) #(NUM) ... vs (TEAM) #(NUM)

    var WINNER_IDX = 1;
    var TEAM_1_IDX = 2;
    var NUMBER_1_IDX = 3;
    var TEAM_2_IDX = 4;
    var NUMBER_2_IDX = 5;

    var regex = /([A-Z]+)\s+won\s+.*\s+-\s+([A-Z]+)\s+#([0-9]{1,2})\s+.*\s+vs\s+([A-Z]+)\s+#([0-9]{1,2})/;

    var matches = regex.exec(rowText);
    var player1 = this.findPlayer(matches[TEAM_1_IDX], matches[NUMBER_1_IDX]);
    var player2 = this.findPlayer(matches[TEAM_2_IDX], matches[NUMBER_2_IDX]);

    var winner;
    var loser;

    if(matches[WINNER_IDX] === matches[TEAM_1_IDX]) {
      winner = player1;
      loser = player2;
    } else {
      winner = player2;
      loser = player1;
    }

    return {
      type: 'faceoff',
      details: {
        winner: winner,
        loser: loser
      }
    };
  },

  //STL ONGOAL - #17 SCHWARTZ, Wrist, Off. Zone, 48 ft.
  parseShot: function(rowText) {

    //(TEAM) ONGOAL - #(NUM) PLAYER, (TYPE), (ZONE), (DISTANCE)
    var regex = /([A-Z]+)\s+ONGOAL\s+-\s+#([0-9]{1,2})\s+[^,]+,\s+([^\s,]+),\s+([^,]+),\s+(.*)$/;

    var TEAM_IDX = 1;
    var NUM_IDX = 2;
    var TYPE_IDX = 3;
    var ZONE_IDX = 4;
    var DISTANCE_IDX = 5;

    var matches = regex.exec(rowText);
    var shotByTeam = this.TEAM_NAME_MAP[matches[TEAM_IDX]];
    return {
      type: 'shot',
      details: {
        byTeam: shotByTeam,
        onGoal: true,
        blocked: false,
        shotBy: this.findPlayer(matches[TEAM_IDX], matches[NUM_IDX]),
        type: matches[TYPE_IDX],
        location: {
          zone: this.ZONE_MAP[matches[ZONE_IDX]],
          distance: matches[DISTANCE_IDX]
        }
      }
    };
  },

  //NYR TAKEAWAY - #28 MOORE, Def. Zone
  parseTakeaway: function(rowText) {
    //(TEAM) TAKEAWAY - #(NUM) PLAYER, (ZONE)

    var regex =/([A-Z]+)\s+TAKEAWAY\s+-\s+#([0-9]{1,2})\s+[^,]+,\s+(.+)/;
    var BY_TEAM_IDX = 1;
    var TAKEN_BY_IDX = 2;
    var ZONE_IDX = 3;

    var matches = regex.exec(rowText);
    var byTeam = matches[BY_TEAM_IDX];
    var takenByPlayer = this.findPlayer(byTeam, matches[TAKEN_BY_IDX]);
    var zone = this.ZONE_MAP[matches[ZONE_IDX]];
    return {
      type: 'takeaway',
      details : {
        byTeam : this.TEAM_NAME_MAP[byTeam],
        takenBy : takenByPlayer,
        location : {
            zone : zone,
        }
      }
    };
  },

  parseStop: function(rowText) {
    return {
      type: 'stop',
      details: {
        reason: rowText
      }
    };
  },

  //NYR #13 HAYES HIT STL #10 LINDSTROM, Off. Zone
  parseHit: function(rowText) {
    //(TEAM) #(NUM) PLAYER HIT (TEAM) #(NUM) PLAYER, (Zone)

    var BY_TEAM_IDX = 1;
    var BY_PLAYER_NUM_IDX = 2;
    var ON_TEAM_IDX = 3;
    var ON_PLAYER_NUM_IDX = 4;
    var ZONE_IDX = 5;

    var regex = /([A-Z]+)\s+#([0-9]{1,2})\s+.*\s+HIT\s+([A-Z]+)\s+#([0-9]{1,2})\s+[^,]*,\s+(.*)/;
    var matches = regex.exec(rowText);
    return {
      type: 'hit',
      details: {
        byTeam: this.TEAM_NAME_MAP[matches[BY_TEAM_IDX]],
        hitBy: this.findPlayer(matches[BY_TEAM_IDX], matches[BY_PLAYER_NUM_IDX]),
        hitOn: this.findPlayer(matches[ON_TEAM_IDX], matches[ON_PLAYER_NUM_IDX]),
        location: {
          zone: this.ZONE_MAP[matches[ZONE_IDX]]
        }
      }
    };
  },

  //STL #75 REAVES Fighting (maj)(5 min), Off. Zone Drawn By: NYR #42 MCILRATH
  parsePenalty: function(rowText) {

    var BY_TEAM_IDX = 1;
    var BY_PLAYER_NUM_IDX = 2;
    var BY_PLAYER_NAME_IDX = 3;
    var PENALTY_REASON_IDX = 4;
    var MAJ_IDX = 5;
    var PENALTY_MINUTES_IDX  = 6;
    var ZONE_IDX = 7;
    var PENALTY_DRAWN_BY_TEAM_IDX = 8;
    var PENALTY_DRAWN_BY_NUM_IDX = 9;
    var PENALTY_DRAWN_BY_NAME_IDX = 10;

    var regex = /([A-Z]+)\s#([0-9]{1,2})\s([A-Z]+)\s([a-zA-Z]+)(\s\(maj\))?\(([1-9]+)\smin\),?\s+([a-zA-Z]+.\sZone\s)?Drawn By:\s([A-Z]+)\s#([0-9]{1,2})\s([a-zA-Z]+)/;

    var matches = regex.exec(rowText);
    var majorExists = (matches[MAJ_IDX] != undefined);
    var zoneExists = (matches[ZONE_IDX] != undefined);

    return {
      byTeam : this.TEAM_NAME_MAP[matches[BY_TEAM_IDX]],
      penaltyBy : this.findPlayer(matches[BY_TEAM_IDX], matches[BY_PLAYER_NUM_IDX]),
      penaltyDrawnBy : this.findPlayer(matches[PENALTY_DRAWN_BY_TEAM_IDX], matches[PENALTY_DRAWN_BY_NUM_IDX]),
      location : { zone : ( zoneExists ? this.ZONE_MAP[matches[ZONE_IDX].trim()] : null ) },
      reason : matches[PENALTY_REASON_IDX],
      isMajor : majorExists,
      penaltyMinutes : matches[PENALTY_MINUTES_IDX],
    };
  },

  parsePeriodEnd: function() {
    return {
      type: 'periodEnd'
    };
  },

  parseGameEnd: function() {
    return {
      type: 'gameEnd'
    };
  },

  parseShootoutComplete: function() {
    return {
      type: 'shootoutComplete'
    };
  },

  //NYR GIVEAWAY - #16 BRASSARD, Def. Zone
  parseGiveaway: function(rowText) {

  //(TEAM) GIVEAWAY - #(NUM) PLAYER, (ZONE)
  var regex = /([A-Z]{2,3})\s+GIVEAWAY\s+-\s+#([0-9]{1,2})\s+[^,]*,\s+(.*)$/;

  var TEAM_IDX = 1;
  var PLAYER_NUM_IDX = 2;
  var ZONE_IDX = 3;

  var matches = regex.exec(rowText);
    return {
      type: 'giveaway',
      details: {
        byTeam: this.TEAM_NAME_MAP[matches[TEAM_IDX]],
        givenBy: this.findPlayer(matches[TEAM_IDX], matches[PLAYER_NUM_IDX]),
        location: {
          zone: this.ZONE_MAP[matches[ZONE_IDX]]
        }
      }
    };
  },

  //STL #32 PORTER BLOCKED BY NYR #42 MCILRATH, Wrist, Def. Zone
  parseBlock: function(rowText) {

    //(TEAM) #(NUM) PLAYER BLOCKED BY (TEAM) #(NUM) PLAYER, (SHOT), (ZONE)
    var regex = /([A-Z]{2,3})\s+#([0-9]{1,2})\s+.*\s+BLOCKED\s+BY\s+([A-Z]{2,3})\s+#([0-9]{1,2})\s+[^,]*,\s+([^,]*),\s+(.*)$/;

    var SHOT_TEAM_IDX = 1;
    var SHOT_PLAYER_IDX = 2;
    var BLOCKED_TEAM_IDX = 3;
    var BLOCKED_PLAYER_IDX = 4;
    var SHOT_IDX = 5;
    var ZONE_IDX = 6;

    var matches = regex.exec(rowText);

    return {
      type: 'shot',
      details: {
        byTeam: this.TEAM_NAME_MAP[matches[SHOT_TEAM_IDX]],
        onGoal: true,
        blocked: true,
        shotBy: this.findPlayer(matches[SHOT_TEAM_IDX], matches[SHOT_PLAYER_IDX]),
        blockedBy: this.findPlayer(matches[BLOCKED_TEAM_IDX], matches[BLOCKED_PLAYER_IDX]),
        type: matches[SHOT_IDX],
        location: {
          zone: this.ZONE_MAP[matches[ZONE_IDX]]
        }
      }
    };
  },

  //NYR #62 HAGELIN, Wrist, Wide of Net, Off. Zone, 30 ft.
  parseMissedShot: function(rowText) {

    //(TEAM) #(NUM) PLAYER, (TYPE), (DETAIL), (ZONE), (DISTANCE)
    var regex = /([A-Z]{2,3})\s+#([0-9]{1,2})\s+[^,]*,\s+([^,]*),(?:\s+([^,]*),)?\s+([^,]*),\s+(.*)$/;
    //var regex = /([A-Z]{2,3})\s+#([0-9]{1,2})\s+[^,]*,\s+([^,]*)?,\s+([^,]*),\s+([^,]*),\s+(.*)$/;

    var TEAM_IDX = 1;
    var PLAYER_IDX = 2;
    var SHOT_TYPE_IDX = 3;
    var SHOT_DETAIL_IDX = 4;
    var ZONE_IDX = 5;
    var DISTANCE_IDX = 6;

    var matches = regex.exec(rowText);

    return {
      type: 'shot',
      details: {
        byTeam: this.TEAM_NAME_MAP[matches[TEAM_IDX]],
        onGoal: false,
        shotBy: this.findPlayer(matches[TEAM_IDX], matches[PLAYER_IDX]),
        type: matches[SHOT_TYPE_IDX],
        location: {
          zone: this.ZONE_MAP[matches[ZONE_IDX]],
          distance: matches[DISTANCE_IDX],
          details: matches[SHOT_DETAIL_IDX]
        }
      }
    };
  },

  parseGoal: function(rowText) {
    return {
      'type': 'goal'
    };
  }

};
