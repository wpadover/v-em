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

module.exports = function(file, results) {

  results.events = [];

  return readFile(file)
  .then(cheerio.load)
  .then(function($) {

    var eventTransformer = new EventTransformer(results);

    allEvents($).each(function(i, e) {
      results.events.push(eventTransformer.buildEvent(cheerio(e)));
    });

  });

};

function allEvents($) {
  return $('tr.evenColor');
}


function EventTransformer(results) {
  this.results = results;
  this.homeTeam = this.results.gameInfo.homeTeam.name;
  this.awayTeam = this.results.gameInfo.awayTeam.name;
  this.homeRoster = this.mapRoster(this.homeTeam);
  this.awayRoster = this.mapRoster(this.awayTeam);

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
    var rowText = row.eq(DESCRIPTION_CELL).text();

    if (this.EVENT_MAP.hasOwnProperty(parsedEventType)) {
      return _.merge(thisEvent, this.EVENT_MAP[parsedEventType](rowText));
    } else {
      console.log('Found unrecognized event type: ' + parsedEventType);
      return thisEvent;
    }
  },

  mapRoster: function(teamName) {

    return _.reduce(this.results.rosters[teamName], function(mappedRoster, playerObj) {
      mappedRoster[playerObj.number + playerObj.position] = playerObj.name;
      return mappedRoster;
    }, {});

  },

  playersOnIce: function(row) {

    var players = {};
    players[this.homeTeam] =
      this.playersOnIceForTeam(row.eq(HOME_ON_ICE_CELL), this.homeRoster);
    players[this.awayTeam] =
      this.playersOnIceForTeam(row.eq(AWAY_ON_ICE_CELL), this.awayRoster);

    return players;

  },

  playersOnIceForTeam: function(cell, teamRoster) {

    var players = [];

    var playersCells = cell.children('table').children('tr').children('td').filter(function(index, elem) {
      //Remove blank cells
      return !!(cheerio(elem).text().trim());
    });

    playersCells.each(function (i, playerCell) {
      players.push(teamRoster[cheerio(playerCell).text()]);
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

  parsePeriodStart: function(rowText) {
    return {
      'type': 'periodStart'
    };
  },

  parseFaceoff: function(rowText) {
    var eventDescription = { winner : null, player1 : null, player2 : null};
    
    return {
      'type': 'faceoff'
    };
  },

  parseShot: function(rowText) {
    return {
      'type': 'shot'
    };
  },

  parseTakeaway: function(rowText) {
    return {
      'type': 'takeaway'
    };
  },

  parseStop: function(rowText) {
    return {
      'type': 'stop'
    };
  },

  parseHit: function(rowText) {
    return {
      'type': 'hit'
    };
  },

  parsePenalty: function(rowText) {
    return {
      'type': 'penalty'
    };
  },

  parseGoal: function(rowText) {
    return {
      'type': 'goal'
    };
  },

  parsePeriodEnd: function(rowText) {
    return {
      'type': 'periodEnd'
    };
  },

  parseGiveaway: function(rowText) {
    return {
      'type': 'giveaway'
    };
  },

  parseBlock: function(rowText) {
    return {
      'type': 'shot'
    };
  },

  parseMissedShot: function(rowText) {
    return {
      'type': 'shot'
    };
  },

  parsePeriodEnd: function(rowText) {
    return {
      'type': 'periodEnd'
    };
  },

  parseShootoutComplete: function(rowText) {
    return {
      'type': 'shootoutComplete'
    };
  },

  parseGameEnd: function(rowText) {
    return {
      'type': 'gameEnd'
    };
  }
};
