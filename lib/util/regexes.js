module.exports = exports = {
  groupFor: groupFor,
  for: regexFor
};

var REGEXES = {
  PLAYER: '[A-Z.\\s-]*',
  TEAM: '[A-Z.]+',
  NUMBER: '#[0-9]{1,2}',
  NUMBER_GROUP: '#([0-9]{1,2})',
  WHITESPACE: '\\s+',
  SHOT: '[A-Za-z\\s.-]*',
  ZONE: '[A-Za-z]*. Zone'
};

function groupFor(expr) {
  expr = expr.toUpperCase();

  //Check if there is a specific override for this regex
  return REGEXES.hasOwnProperty(expr + '_GROUP') ?
            REGEXES[expr+'_GROUP']
            : '(' + regexFor(expr) + ')';
}

function regexFor(expr) {
  return REGEXES[(expr || '').toUpperCase()];
}
