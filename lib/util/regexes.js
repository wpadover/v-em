var _ = require('lodash');

var REGEXES = {
  PLAYER: '[A-Z.\\s-\']*',
  TEAM: '[A-Z.]+',
  NUMBER: '#[0-9]{1,2}',
  WHITESPACE: '[\\s\u00A0]+',
  SHOT: '[A-Za-z\\s.-]*',
  ZONE: '[A-Za-z]*. Zone',
  DISTANCE: '[0-9]*\\s+ft\\.'
};

//Items with special behavior when used as a capture group
var SPECIAL_GROUPS = {
  NUMBER: '#([0-9]{1,2})'
};

var GROUPS = _.merge(_.mapValues(REGEXES, function(regex) {
  return '(' + regex + ')';
}), SPECIAL_GROUPS);

module.exports = exports = {
  matches: REGEXES,
  groups: GROUPS
};
