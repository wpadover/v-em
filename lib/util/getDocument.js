var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

module.exports = function(season, identifier) {
  var url = urlFor(season, identifier);
  console.log('Downloading from ' + url + ' ...');
  return request.getAsync(url)
  .tap(function() {
    console.log('Downloading ' + url + ' complete');
  })
  .spread(removeNewLines);
};

function removeNewLines(response, body) {
  return body.replace(/(\r\n|\n|\r)/gm,'');
}

function urlFor(season, identifier) {
	var URL = 'http://www.nhl.com/scores/htmlreports/' + season + '/' + identifier + '.HTM';
	//console.log("Trying to fetch URL: ", URL);
  return URL;
}
