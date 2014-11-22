//STL #32 PORTER BLOCKED BY NYR #42 MCILRATH, Wrist, Def. Zone


//(TEAM) #(NUM) PLAYER BLOCKED BY (TEAM) #(NUM) PLAYER, (SHOT), (ZONE)
var regex = /([A-Z]{2,3})\s+#([0-9]{1,2})\s+.*\s+BLOCKED\s+BY\s+([A-Z]{2,3})\s+#([0-9]{1,2})\s+[^,]*,\s+([^,]*),\s+(.*)$/;

var SHOT_TEAM_IDX = 1;
var SHOT_PLAYER_IDX = 2;
var BLOCKED_TEAM_IDX = 3;
var BLOCKED_PLAYER_IDX = 4;
var SHOT_IDX = 5;
var ZONE_IDX = 6;


function parseBlock(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log("ERROR: Could not parse BLOCK EVENT row text: ", rowText);
    return;
  }

  var byTeam = gameUtil.teamForAbbreviation(matches[SHOT_TEAM_IDX]);
  var shotBy = gameUtil.findPlayer(matches[SHOT_TEAM_IDX],
    matches[SHOT_PLAYER_IDX]);
  var blockedBy = gameUtil.findPlayer(matches[BLOCKED_TEAM_IDX],
    matches[BLOCKED_PLAYER_IDX]);
  var shotType = matches[SHOT_IDX];
  var zone = gameUtil.translateZone([matches[ZONE_IDX]]);

  return {
    type: 'shot',
    details: {
      byTeam: byTeam,
      onGoal: true,
      blocked: true,
      shotBy: shotBy,
      blockedBy: blockedBy,
      type: shotType,
      location: {
        zone: zone
      }
    }
  };
}


module.exports = exports = parseBlock;
