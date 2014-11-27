var cheerio = require('cheerio');
var getDocument = require('./util/getDocument');
var GameInfoUtil = require('./events/gameInfoUtil');
var basicEvent = require('./events/basicEvent');
var _ = require('lodash');


module.exports = function(season, gameId) {

  return function parseEvents(results) {

    results.events = [];

    return getDocument(season, gameIdentifier(gameId))
    .then(cheerio.load)
    .then(function($) {

      var eventTransformer = new EventTransformer(results);

      allEvents($).each(function(i, e) {
        var row = eventTransformer.buildEvent(cheerio(e).children('td'));
        if (row) {
          results.events.push(row);
        }
      });

      return results;

    });

  };

};

function gameIdentifier(gameId) {
  return 'PL' + gameId;
}

function allEvents($) {
  return $('tr.evenColor');
}


function EventTransformer(results) {

  this.gameInfoUtil = new GameInfoUtil(results);

  this.EVENT_MAP = {
    PSTR: require('./events/periodStart'),
    FAC: require('./events/faceoff'),
    HIT: require('./events/hit'),
    SHOT: require('./events/shot'),
    STOP: require('./events/stop'),
    GIVE: require('./events/giveaway'),
    BLOCK: require('./events/block'),
    TAKE: require('./events/takeaway'),
    MISS: require('./events/missedShot'),
    PENL: require('./events/penalty'),
    GOAL: require('./events/goal'),
    PEND: require('./events/periodEnd'),
    SOC: require('./events/shootoutComplete'),
    GEND: require('./events/gameEnd')
  };

  this.IGNORABLE_EVENTS = {
    GOFF: true,   // ????
    EISTR: true,  // Early Intermission start
    EIEND: true   // Early intermission end
  };

}

EventTransformer.prototype = {

  buildEvent: function (row) {

    var DESCRIPTION_CELL = 5;

    var thisEvent = basicEvent(row, this.gameInfoUtil);

    var parsedEventType = this.eventType(row);
    var rowText = row.eq(DESCRIPTION_CELL).text().trim();

    if (this.IGNORABLE_EVENTS[parsedEventType]) {
      return undefined;
    }

    if (this.EVENT_MAP.hasOwnProperty(parsedEventType)) {
      var boundFn = this.EVENT_MAP[parsedEventType].bind(this);
      return _.merge(thisEvent, boundFn(rowText, this.gameInfoUtil));
    } else {
      console.log('Found unrecognized event type: ' + parsedEventType);
      return thisEvent;
    }
  },

  eventType: function(row) {

    var EVENT_CELL = 4;

    return row.eq(EVENT_CELL).text().trim();
  }

};
