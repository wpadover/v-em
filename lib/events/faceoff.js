//NYR won Def. Zone - STL #12 LEHTERA vs NYR #16 BRASSARD


//(TEAM) won .... - (TEAM) #(NUM) ... vs (TEAM) #(NUM)
var regex = /([A-Z]+)\s+won\s+.*\s+-\s+([A-Z]+)\s+#([0-9]{1,2})\s+.*\s+vs\s+([A-Z]+)\s+#([0-9]{1,2})/;

var WINNER_IDX = 1;
var TEAM_1_IDX = 2;
var NUMBER_1_IDX = 3;
var TEAM_2_IDX = 4;
var NUMBER_2_IDX = 5;


function parseFaceoff(rowText, gameUtil) {

  var matches = regex.exec(rowText);
  var player1 = gameUtil.findPlayer(matches[TEAM_1_IDX], matches[NUMBER_1_IDX]);
  var player2 = gameUtil.findPlayer(matches[TEAM_2_IDX], matches[NUMBER_2_IDX]);

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
    }
  };
}


module.exports = exports = parseFaceoff;
