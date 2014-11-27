var regexes = require('../util/regexes');
//NYR TAKEAWAY - #28 MOORE, Def. Zone


//(TEAM) TAKEAWAY - #(NUM) PLAYER, (ZONE)
var regex = new RegExp(
  regexes.group('TEAM') +
  regexes.get('WHITESPACE') +
  'TAKEAWAY\\s+-\\s+' +
  regexes.group('NUMBER') +
  regexes.get('WHITESPACE') +
  regexes.get('PLAYER') +
  ',\\s+' +
  regexes.group('ZONE')
);

var BY_TEAM_IDX = 1;
var TAKEN_BY_IDX = 2;
var ZONE_IDX = 3;


function parseTakeaway(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log('ERROR: Could not parse TAKEAWAY EVENT row text: ', rowText);
    return;
  }

  var byTeam = gameUtil.teamForAbbreviation(matches[BY_TEAM_IDX]);
  var takenByPlayer = gameUtil.findPlayer(matches[BY_TEAM_IDX],
    matches[TAKEN_BY_IDX]);
  var zone = gameUtil.translateZone([matches[ZONE_IDX]]);

  return {
    type: 'takeaway',
    details : {
      byTeam :  byTeam,
      takenBy : takenByPlayer,
      location : {
          zone : zone,
      }
    }
  };
}


module.exports = exports = parseTakeaway;
