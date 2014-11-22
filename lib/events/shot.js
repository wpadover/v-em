//STL ONGOAL - #17 SCHWARTZ, Wrist, Off. Zone, 48 ft.


//(TEAM) ONGOAL - #(NUM) PLAYER, (TYPE), (ZONE), (DISTANCE)
var regex = /([A-Z]+)\s+ONGOAL\s+-\s+#([0-9]{1,2})\s+[^,]+,\s+([^\s,]+),\s+([^,]+),\s+(.*)$/;

var TEAM_IDX = 1;
var NUM_IDX = 2;
var TYPE_IDX = 3;
var ZONE_IDX = 4;
var DISTANCE_IDX = 5;


function parseShot(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log("ERROR: Could not parse SHOT EVENT row text: ", rowText);
    return;
  }

  var byTeam = gameUtil.teamForAbbreviation([matches[TEAM_IDX]]);
  var shotBy = gameUtil.findPlayer(matches[TEAM_IDX], matches[NUM_IDX]);
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
      location: {
        zone: zone,
        distance: distance
      }
    }
  };
}


module.exports = exports = parseShot;
