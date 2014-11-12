var Promise = require('bluebird');
var cheerio = require('cheerio');
var readFile = require('../util/readFile');
var _ = require('lodash');

var PERIOD_CELL = 1;
var STRENGTH_CELL = 2;
var TIME_CELL = 3;
var EVENT_CELL = 4;
var DESCRIPTION_CELL = 5;
var AWAY_ON_ICE_CELL = 6;
var HOME_ON_ICE_CELL = 7;

var TIME_ELAPSED_INDEX = 0;
var GAME_TIME_INDEX = 1;

var EVENT_MAP = {
  'PSTR': parsePeriodStart,
  'FAC': parseFaceoff,
  'HIT': parseHit,
  'SHOT': parseShot,
  'STOP': parseStop,
  'GIVE': parseGiveaway,
  'BLOCK': parseBlock,
  'TAKE': parseTakeaway,
  'MISS': parseMissedShot,
  'PENL': parsePenalty,
  'GOAL': parseGoal,
  'PEND': parsePeriodEnd,
  'SOC': parseShootoutComplete,
  'GEND': parseGameEnd
};

//TODO - Playoff games? Other OTs?
var PERIODS = [
  '1',
  '2',
  '3',
  'OT',
  'SO'
];

module.exports = function(file, result) {

  result.events = [];

  return readFile(file)
  .then(cheerio.load)
  .then(function($) {
    events($).each(function(i, e) {
      result.events.push(buildEvent(cheerio(e)));
    });

  });

};

function events($) {
  return $('tr.evenColor');
}

function buildEvent(e) {
  var thisEvent = {};

  var row = e.children('td');

  thisEvent.period = period(row);
  thisEvent.evenStrength = isEvenStrength(row);
  thisEvent.timeElapsed = timeElapsed(row);
  thisEvent.gameTime = gameTime(row);

  var parsedEventType = eventType(row);

  if (EVENT_MAP.hasOwnProperty(parsedEventType)) {
    return _.merge(thisEvent, EVENT_MAP[parsedEventType](row));
  } else {
    console.log('Found unrecognized event type: ' + parsedEventType);
    return thisEvent;
  }

}

function eventType(row) {
  return row.eq(EVENT_CELL).text().trim();
}

function period(row) {
  return PERIODS[parseInt(row.eq(PERIOD_CELL).text().trim())-1];
}

function timeElapsed(row) {
  var times = row.eq(TIME_CELL).html().split('<br>');
  return times[TIME_ELAPSED_INDEX];
}

function gameTime(row) {
  var times = row.eq(TIME_CELL).html().split('<br>');
  return times[GAME_TIME_INDEX];
}

function isEvenStrength(row) {

  var strength = row.eq(STRENGTH_CELL).text();

  // If strength is SH or PP
  return !_.contains(['SH', 'PP'], (strength || "").trim());
}

function parsePeriodStart(row) {
  return {
    'type': 'periodStart'
  };
}

function parseFaceoff(row) {
  return {
    'type': 'faceoff'
  };
}

function parseShot(row) {
  return {
    'type': 'shot'
  };
}

function parseTakeaway(row) {
  return {
    'type': 'takeaway'
  };
}

function parseStop(row) {
  return {
    'type': 'stop'
  };
}

function parseHit(row) {
  return {
    'type': 'hit'
  };
}

function parsePenalty(row) {
  return {
    'type': 'penalty'
  };
}

function parseGoal(row) {
  return {
    'type': 'goal'
  };
}

function parsePeriodEnd(row) {
  return {
    'type': 'periodEnd'
  };
}

function parseGiveaway(row) {
  return {
    'type': 'giveaway'
  };
}

function parseBlock(row) {
  return {
    'type': 'shot'
  };
}

function parseMissedShot(row) {
  return {
    'type': 'shot'
  };
}

function parsePeriodEnd(row) {
  return {
    "type": "periodEnd"
  };
}

function parseShootoutComplete(row) {
  return {
    "type": "shootoutComplete"
  };
}

function parseGameEnd(row) {
  return {
    "type": "gameEnd"
  };
}
