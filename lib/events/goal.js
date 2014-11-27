var regexes = require('../util/regexes');
//NYR #20 KREIDER(3), Tip-In, Off. Zone, 12 ft.Assists: #44 HUNWICK(3); #63 DUCLAIR(5)
//STL #21 BERGLUND(1), Wrist, Off. Zone, 11 ft.Assist: #5 JACKMAN(2)
//NYR #12 STEMPNIAK, Backhand, Off. Zone, 12 ft.


//(TEAM) #(NUM) PLAYER, (TYPE), (ZONE), (DISTANCE)
//(TEAM) #(NUM) PLAYER, (TYPE), (ZONE), (DISTANCE)Assist: #(NUM)
//(TEAM) #(NUM) PLAYER, (TYPE), (ZONE), (DISTANCE)Assists: #(NUM); #(NUM)
var regex = new RegExp(
  regexes.group('TEAM') +
  regexes.get('WHITESPACE') +
  regexes.group('NUMBER') +
  regexes.get('WHITESPACE') +
  regexes.get('PLAYER') +
  '[^,]*,\\s+' +
  regexes.group('SHOT') +
  ',\\s+' +
  regexes.group('ZONE') +
  ',\\s+' +
  regexes.group('DISTANCE') +
  '(?:Assists?:\\s+' +
  regexes.group('NUMBER') +
  '\\s+[^;]*(?:;\\s+' +
  regexes.group('NUMBER') +
  ')?)?'
);

var TEAM_IDX = 1;
var PLAYER_IDX = 2;
var TYPE_IDX = 3;
var ZONE_IDX = 4;
var DISTANCE_IDX = 5;
var PRIMARY_ASSIST_IDX = 6;
var SECONDARY_ASSIST_IDX = 7;


function parseGoal(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log('ERROR: Could not parse GOAL EVENT row text: ', rowText);
    return;
  }

  var byTeam = gameUtil.teamForAbbreviation([matches[TEAM_IDX]]);
  var shotBy = gameUtil.findPlayer(matches[TEAM_IDX],
    matches[PLAYER_IDX]);
  var shotType = matches[TYPE_IDX];
  var zone = gameUtil.translateZone(matches[ZONE_IDX]);
  var distance = matches[DISTANCE_IDX];
  var primaryAssist = matches[PRIMARY_ASSIST_IDX] ?
      gameUtil.findPlayer(matches[TEAM_IDX], matches[PRIMARY_ASSIST_IDX])
      : undefined;

  var secondaryAssist = matches[SECONDARY_ASSIST_IDX] ?
      gameUtil.findPlayer(matches[TEAM_IDX], matches[SECONDARY_ASSIST_IDX])
      : undefined;

  return {
    type: 'goal',
    details: {
      byTeam: byTeam,
      shotBy: shotBy,
      type: shotType,
      location: {
        zone: zone,
        distance: distance,
      },
      primaryAssist: primaryAssist,
      secondaryAssist: secondaryAssist
    }
  };
}


module.exports = exports = parseGoal;
