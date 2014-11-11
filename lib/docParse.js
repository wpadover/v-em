var util = require('util');
var roster = require('./roster');
var stats = require('./stats');

module.exports = parse;

var parse = function() {

  var results = { };

  return roster('./test_data/roster.html', results)
  .then(function() {
    return stats('./test_data/stats.html', results);
  })
  .return(results);

};

//TEMPORARY FOR TESTING
parse().then(function (data) {
  console.log(JSON.stringify(data, null, 4));
});
