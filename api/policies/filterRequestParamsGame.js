/**
 * Whitelisting editable request parameters
 */

var _ = require("lodash")
  ; 

module.exports = function(req, res, next) {
  var whiteList = [
    'gameTime',
    'pollingCutoff',
    'locationName',
    'address',
    'minimumPlayers'  
  ]

  req.body = _.pick(req.body, whiteList);
  next();
}
