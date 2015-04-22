var regexes = require('../util/regexes');
//STL ONGOAL - #17 SCHWARTZ, Wrist, Off. Zone, 48 ft.


//(TEAM) ONGOAL - #(NUM) PLAYER, (TYPE), (ZONE), (DISTANCE)
var regex = new RegExp(
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  'ONGOAL\\s+-\\s+' +
  regexes.groups.NUMBER +
  regexes.matches.WHITESPACE +
  regexes.matches.PLAYER +
  ',' +
  '(?:\\s+([^,]+),)?' +  //Penalty shot?
  regexes.matches.WHITESPACE +
  regexes.groups.SHOT +
  ',\\s+' +
  regexes.groups.ZONE +
  ',\\s+' +
  regexes.groups.DISTANCE
);

var TEAM_IDX = 1;
var NUM_IDX = 2;
var PENALTY_SHOT_IDX = 3;
var TYPE_IDX = 4;
var ZONE_IDX = 5;
var DISTANCE_IDX = 6;

function parseShot(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log('ERROR: Could not parse SHOT EVENT row text: ', rowText);
    return;
  }

  var byTeam = gameUtil.teamForAbbreviation([matches[TEAM_IDX]]);
  var shotBy = gameUtil.findPlayer(matches[TEAM_IDX], matches[NUM_IDX]);
  var isPenaltyShot = (matches[PENALTY_SHOT_IDX] !== undefined);
  var type = matches[TYPE_IDX];
  var zone = gameUtil.translateZone([matches[ZONE_IDX]]);
  var distance = matches[DISTANCE_IDX];

  return {
    type: 'shot',
    details: {
      byTeam: byTeam,
      onGoal: true,
      blocked: false,
      shotBy: shotBy,
      type: type,
      penaltyShot: isPenaltyShot,
      location: {
        zone: zone,
        distance: distance
      }
    }
  };
}


module.exports = exports = parseShot;
