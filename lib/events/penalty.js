var regexes = require('../util/regexes');
//STL #75 REAVES Fighting (maj)(5 min), Off. Zone Drawn By: NYR #42 MCILRATH


var regex = new RegExp(
  regexes.group('TEAM') +
  regexes.get('WHITESPACE') +
  regexes.group('NUMBER') +
  regexes.get('WHITESPACE') +
  regexes.get('PLAYER') +
  regexes.get('WHITESPACE') +
  '([^(]*)' + //Penalty name
  '(\\s\\(maj\\))?' + //Major?
  '\\(([0-9]+)\\s+min\\),?' + //Minutes
  regexes.get('WHITESPACE') +
  '((?:' +
  regexes.get('ZONE') +
  regexes.get('WHITESPACE') +
  ')?)' +
  'Drawn By:' +
  regexes.get('WHITESPACE') +
  regexes.group('TEAM') +
  regexes.get('WHITESPACE') +
  regexes.group('NUMBER') +
  regexes.get('PLAYER')
);

var BY_TEAM_IDX = 1;
var BY_PLAYER_NUM_IDX = 2;
var PENALTY_REASON_IDX = 3;
var MAJ_IDX = 4;
var PENALTY_MINUTES_IDX  = 5;
var ZONE_IDX = 6;
var PENALTY_DRAWN_BY_TEAM_IDX = 7;
var PENALTY_DRAWN_BY_NUM_IDX = 8;


function parsePenalty(rowText, gameUtil) {
  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log('ERROR: Could not parse PENALTY EVENT row text: ', rowText);
    return;
  }

  var majorExists = (matches[MAJ_IDX] !== undefined);
  var zoneExists = (matches[ZONE_IDX] !== undefined);

  var byTeam = gameUtil.teamForAbbreviation(matches[BY_TEAM_IDX]);
  var penaltyBy = gameUtil.findPlayer(matches[BY_TEAM_IDX],
    matches[BY_PLAYER_NUM_IDX]);

  var penaltyDrawnBy = gameUtil.findPlayer(matches[PENALTY_DRAWN_BY_TEAM_IDX],
    matches[PENALTY_DRAWN_BY_NUM_IDX]);
  var zone =  zoneExists ?
                gameUtil.translateZone(matches[ZONE_IDX].trim())
                : null;
  var reason = matches[PENALTY_REASON_IDX];
  var penaltyMinutes = matches[PENALTY_MINUTES_IDX];

  return {
    type: 'penalty',
    details: {
      byTeam: byTeam,
      penaltyBy: penaltyBy,
      penaltyDrawnBy: penaltyDrawnBy,
      location: {
        zone : zone
      },
      reason : reason,
      isMajor : majorExists,
      penaltyMinutes : penaltyMinutes
    }
  };
}


module.exports = exports = parsePenalty;
