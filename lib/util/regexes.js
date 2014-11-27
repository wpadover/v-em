module.exports = exports = {
  group: group,
  get: get
};

var REGEXES = {
  PLAYER: '[A-Z.\\s-]*',
  TEAM: '[A-Z.]+',
  NUMBER: '#[0-9]{1,2}',
  NUMBER_GROUP: '#([0-9]{1,2})',
  WHITESPACE: '\\s+',
  SHOT: '[A-Za-z\\s.-]*',
  ZONE: '[A-Za-z]*. Zone',
  DISTANCE: '[0-9]*\\s+ft\\.'
};

function group(expr) {
  expr = expr.toUpperCase();

  //Check if there is a specific override for this regex
  return REGEXES.hasOwnProperty(expr + '_GROUP') ?
            REGEXES[expr+'_GROUP']
            : '(' + get(expr) + ')';
}

function get(expr) {
  return REGEXES[(expr || '').toUpperCase()];
}
