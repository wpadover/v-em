var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

module.exports = function(file) {
  return fs.readFileAsync(file, "utf8")
  .then(removeNewLines);
};

function removeNewLines(text) {
  return text.replace(/(\r\n|\n|\r)/gm,"");
}
