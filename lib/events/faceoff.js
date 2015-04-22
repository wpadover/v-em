var regexes = require('../util/regexes');

//NYR won Def. Zone - STL #12 LEHTERA vs NYR #16 BRASSARD


//(TEAM) won (ZONE) - (TEAM) #(NUM) ... vs (TEAM) #(NUM)
var regex = new RegExp(
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  'won\\s+' +
  regexes.groups.ZONE +
  '\\s+-\\s+' +
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER +
  regexes.matches.WHITESPACE +
  regexes.matches.PLAYER +
  regexes.matches.WHITESPACE +
  'vs' +
  regexes.matches.WHITESPACE +
  regexes.groups.TEAM +
  regexes.matches.WHITESPACE +
  regexes.groups.NUMBER
);

var WINNER_IDX = 1;
var ZONE_IDX = 2;
var TEAM_1_IDX = 3;
var NUMBER_1_IDX = 4;
var TEAM_2_IDX = 5;
var NUMBER_2_IDX = 6;


function parseFaceoff(rowText, gameUtil) {

  var matches = regex.exec(rowText);

  if ( !matches )
  {
    console.log('ERROR: Could not parse FACEOFF EVENT row text: ', rowText);
    return;
  }

  var player1 = gameUtil.findPlayer(matches[TEAM_1_IDX], matches[NUMBER_1_IDX]);
  var player2 = gameUtil.findPlayer(matches[TEAM_2_IDX], matches[NUMBER_2_IDX]);
  var zone = gameUtil.translateZone(matches[ZONE_IDX]);

  var winner;
  var loser;

  if(matches[WINNER_IDX] === matches[TEAM_1_IDX]) {
    winner = player1;
    loser = player2;
  } else {
    winner = player2;
    loser = player1;
  }

  return {
    type: 'faceoff',
    details: {
      winner: winner,
      loser: loser
    },
    location: {
      zone: zone
    }
  };
}


module.exports = exports = parseFaceoff;
