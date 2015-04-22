var regexes = require('../util/regexes');
//STL #75 REAVES Fighting (maj)(5 min), Off. Zone Drawn By: NYR #42 MCILRATH
//COL #  Game Misconduct - Head coach(0 min) Served By: #58 BORDELEAU, Neu. Zone


var regexPenaltyGeneric = new RegExp(
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER +
  '?' +
  regexes.matches.WHITESPACE +
  regexes.matches.PLAYER +
  '?' +
  regexes.matches.WHITESPACE +
  '([^(]*)' + //Penalty name
  '(\\s\\(maj\\))?' + //Major?
  '\\(([0-9]+)\\s+min\\),?' + //Minutes
  '(?:' +
  regexes.matches.WHITESPACE +
  ')?' +
  '(?:Served By:' +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER +
  regexes.matches.PLAYER +
  ',)?' +
  '(?:' +
  regexes.matches.WHITESPACE +
  ')?' +
  '((?:' +
  regexes.matches.ZONE +
  '(?:' +
  regexes.matches.WHITESPACE +
  ')?' +
  ')?)' +
  '(?:Drawn By:' +
  regexes.matches.WHITESPACE +
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER +
  regexes.matches.PLAYER +
  ')?'
);

var BY_TEAM_IDX = 1;
var BY_PLAYER_NUM_IDX = 2;
var PENALTY_REASON_IDX = 3;
var MAJ_IDX = 4;
var PENALTY_MINUTES_IDX  = 5;
var SERVED_BY_IDX = 6;
var ZONE_IDX = 7;
var PENALTY_DRAWN_BY_TEAM_IDX = 8;
var PENALTY_DRAWN_BY_NUM_IDX = 9;

//WPG TEAM Too many men/ice - bench(2 min) Served By: #12 JOKINEN
var regexBenchPenalty = new RegExp(
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  'TEAM' +
  regexes.matches.WHITESPACE +
  '([A-Za-z\/\\s]+)' + //Reason
  regexes.matches.WHITESPACE +
  '-' +
  regexes.matches.WHITESPACE +
  'bench' +
  '\\(([0-9]+)\\s+min\\),?' + //Minutes
  regexes.matches.WHITESPACE +
  'Served By:' +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER
);

var BENCH_TEAM_IDX = 1;
var BENCH_REASON_IDX = 2;
var BENCH_PENALTY_MINUTES_IDX = 3;
var BENCH_SERVED_BY = 4;


function parsePenalty(rowText, gameUtil) {

  var benchMatches = regexBenchPenalty.exec(rowText);
  if(benchMatches)
  {
      return parseBenchPenalty(benchMatches, gameUtil);
  }
  else
  {
      return parseGenericPenalty(rowText, gameUtil);
  }
}

function parseGenericPenalty(rowText, gameUtil) {
  var matches = regexPenaltyGeneric.exec(rowText);

  if ( !matches ) {
    console.log('ERROR: Could not parse PENALTY EVENT row text: ', rowText);
    return;
  }

  var majorExists = (matches[MAJ_IDX] !== undefined);

  var byTeam = gameUtil.teamForAbbreviation(matches[BY_TEAM_IDX]);

  var byExists = matches[BY_PLAYER_NUM_IDX] !== undefined;
  var penaltyBy = byExists? gameUtil.findPlayer(matches[BY_TEAM_IDX],
      matches[BY_PLAYER_NUM_IDX])
      : null;

  var penaltyDrawnBy;
  if (matches[PENALTY_DRAWN_BY_TEAM_IDX] && matches[PENALTY_DRAWN_BY_NUM_IDX]) {
    penaltyDrawnBy = gameUtil.findPlayer(matches[PENALTY_DRAWN_BY_TEAM_IDX],
      matches[PENALTY_DRAWN_BY_NUM_IDX]);
  }

  var zoneExists = matches[ZONE_IDX] !== undefined;
  var zone =  zoneExists ?
    gameUtil.translateZone(matches[ZONE_IDX].trim())
    : null;

  var servedByExists = matches[SERVED_BY_IDX] !== undefined;
  var servedBy = servedByExists ?
    gameUtil.findPlayer(matches[BY_TEAM_IDX],
      matches[SERVED_BY_IDX])
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
      penaltyMinutes : penaltyMinutes,
      servedBy: servedBy
    }
  };
}

function parseBenchPenalty(matches, gameUtil) {
    var byTeam = gameUtil.teamForAbbreviation(matches[BENCH_TEAM_IDX]);
    var reason = matches[BENCH_REASON_IDX];
    var penaltyMinutes = matches[BENCH_PENALTY_MINUTES_IDX];
    var servedBy = gameUtil.findPlayer(matches[BENCH_TEAM_IDX], matches[BENCH_SERVED_BY]);

    return {
      type: 'penalty',
      details : {
        byTeam: byTeam,
        penaltyMinutes: penaltyMinutes,
        servedBy: servedBy,
        reason: reason
      }
    };
}


module.exports = exports = parsePenalty;
