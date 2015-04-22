var regexes = require('../util/regexes');
//STL #75 REAVES Fighting (maj)(5 min), Off. Zone Drawn By: NYR #42 MCILRATH


var regexPenaltyGeneric = new RegExp(
  regexes.group('TEAM') +
  regexes.get('WHITESPACE') +
  regexes.group('NUMBER') +
  regexes.get('WHITESPACE') +
  regexes.get('PLAYER') +
  regexes.get('WHITESPACE') +
  '([^(]*)' + //Penalty name
  '(\\s\\(maj\\))?' + //Major?
  '\\(([0-9]+)\\s+min\\),?' + //Minutes
  '(?:' +
  regexes.get('WHITESPACE') +
  ')?' +
  '((?:' +
  regexes.get('ZONE') +
  regexes.get('WHITESPACE') +
  ')?)' +
  '(?:Drawn By:' +
  regexes.get('WHITESPACE') +
  regexes.group('TEAM') +
  regexes.get('WHITESPACE') +
  regexes.group('NUMBER') +
  regexes.get('PLAYER') +
  ')?'
);

var BY_TEAM_IDX = 1;
var BY_PLAYER_NUM_IDX = 2;
var PENALTY_REASON_IDX = 3;
var MAJ_IDX = 4;
var PENALTY_MINUTES_IDX  = 5;
var ZONE_IDX = 6;
var PENALTY_DRAWN_BY_TEAM_IDX = 7;
var PENALTY_DRAWN_BY_NUM_IDX = 8;

//WPG TEAM Too many men/ice - bench(2 min) Served By: #12 JOKINEN
var regexBenchPenalty = new RegExp(
  regexes.group('TEAM') + 
  regexes.get('WHITESPACE') +
  'TEAM' + 
  regexes.get('WHITESPACE') +
  '([A-Za-z\/\\s]+)' + //Reason
  regexes.get('WHITESPACE') + 
  '-' +
  regexes.get('WHITESPACE') +
  'bench' +
  '\\(([0-9]+)\\s+min\\),?' + //Minutes
  regexes.get('WHITESPACE') + 
  'Served By:' +
  regexes.get('WHITESPACE') +
  regexes.group('NUMBER')
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

function parseGenericPenalty(rowText, gameUtil)
{
  var matches = regexPenaltyGeneric.exec(rowText);

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

  var penaltyDrawnBy;
  if (matches[PENALTY_DRAWN_BY_TEAM_IDX] && matches[PENALTY_DRAWN_BY_NUM_IDX]) {
    penaltyDrawnBy = gameUtil.findPlayer(matches[PENALTY_DRAWN_BY_TEAM_IDX],
      matches[PENALTY_DRAWN_BY_NUM_IDX]);
  }

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

function parseBenchPenalty(matches, gameUtil)
{
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
