//NYR GIVEAWAY - #16 BRASSARD, Def. Zone


//(TEAM) GIVEAWAY - #(NUM) PLAYER, (ZONE)
var regex = /([A-Z]{2,3})\s+GIVEAWAY\s+-\s+#([0-9]{1,2})\s+[^,]*,\s+(.*)$/;

var TEAM_IDX = 1;
var PLAYER_NUM_IDX = 2;
var ZONE_IDX = 3;


function parseGiveaway(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log("ERROR: Could not parse GIVEAWAY EVENT row text: ", rowText);
    return;
  }

  var byTeam = gameUtil.teamForAbbreviation(matches[TEAM_IDX]);
  var givenBy = gameUtil.findPlayer(matches[TEAM_IDX],
    matches[PLAYER_NUM_IDX]);
  var zone = gameUtil.translateZone([matches[ZONE_IDX]]);

  return {
    type: 'giveaway',
    details: {
      byTeam: byTeam,
      givenBy: givenBy,
      location: {
        zone: zone
      }
    }
  };
}


module.exports = exports = parseGiveaway;
