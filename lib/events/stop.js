// Whole row is the reason
function parseStop(rowText) {
  return {
    type: 'stop',
    details: {
      reason: rowText
    }
  };
}


module.exports = exports = parseStop;

