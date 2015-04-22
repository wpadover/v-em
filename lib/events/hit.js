var regexes = require('../util/regexes');
//NYR #13 HAYES HIT STL #10 LINDSTROM, Off. Zone


//(TEAM) #(NUM) PLAYER HIT (TEAM) #(NUM) PLAYER, (Zone)
var regex = new RegExp(
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER +
  regexes.matches.WHITESPACE +
  regexes.matches.PLAYER +
  'HIT' +
  regexes.matches.WHITESPACE +
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER +
  regexes.matches.WHITESPACE +
  regexes.matches.PLAYER +
  ',\\s+' +
  regexes.groups.ZONE
);

var BY_TEAM_IDX = 1;
var BY_PLAYER_NUM_IDX = 2;
var ON_TEAM_IDX = 3;
var ON_PLAYER_NUM_IDX = 4;
var ZONE_IDX = 5;


function parseHit(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log('ERROR: Could not parse HIT EVENT row text: ', rowText);
    return;
  }

  var byTeam = gameUtil.teamForAbbreviation(matches[BY_TEAM_IDX]);
  var hitBy = gameUtil.findPlayer(matches[BY_TEAM_IDX],
    matches[BY_PLAYER_NUM_IDX]);
  var hitOn = gameUtil.findPlayer(matches[ON_TEAM_IDX],
    matches[ON_PLAYER_NUM_IDX]);
  var zone = gameUtil.translateZone(matches[ZONE_IDX]);

  return {
    type: 'hit',
    details: {
      byTeam: byTeam,
      hitBy: hitBy,
      hitOn: hitOn,
      location: {
        zone: zone
      }
    }
  };
}


module.exports = exports = parseHit;


