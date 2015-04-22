var regexes = require('../util/regexes');
//NYR #62 HAGELIN, Wrist, Wide of Net, Off. Zone, 30 ft.


//(TEAM) #(NUM) PLAYER, (TYPE), (DETAIL), (ZONE), (DISTANCE)
var regex = new RegExp(
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER +
  regexes.matches.WHITESPACE +
  regexes.matches.PLAYER +
  ',' +
  regexes.matches.WHITESPACE +
  regexes.groups.SHOT +
  ',' +
  '(?:' +
  regexes.matches.WHITESPACE +
  '([^,]*)' + //DETAIL
  ',)?' +
  regexes.matches.WHITESPACE +
  regexes.groups.ZONE +
  ',' +
  regexes.matches.WHITESPACE +
  '(.*)'
);

var TEAM_IDX = 1;
var PLAYER_IDX = 2;
var SHOT_TYPE_IDX = 3;
var SHOT_DETAIL_IDX = 4;
var ZONE_IDX = 5;
var DISTANCE_IDX = 6;


function parseMissedShot(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log('ERROR: Could not parse MISSED SHOT EVENT row text: ', rowText);
    return;
  }

  var byTeam = gameUtil.teamForAbbreviation([matches[TEAM_IDX]]);
  var shotBy = gameUtil.findPlayer(matches[TEAM_IDX], matches[PLAYER_IDX]);
  var shotType = matches[SHOT_TYPE_IDX];
  var zone = gameUtil.translateZone(matches[ZONE_IDX]);
  var distance = matches[DISTANCE_IDX];
  var details = matches[SHOT_DETAIL_IDX];

  return {
    type: 'shot',
    details: {
      byTeam: byTeam,
      onGoal: false,
      shotBy: shotBy,
      type: shotType,
      location: {
        zone: zone,
        distance: distance,
        details: details
      }
    }
  };
}


module.exports = exports = parseMissedShot;
