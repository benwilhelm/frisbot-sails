/** 
 * Whitelisting the parameters that a user can edit
 *
 * This middleware does NOT determine which accounts a user can edit.
 * That is determined in canEditAccount.js
 */

var _ = require('lodash')
  ;

module.exports = function(req, res, next){

  if ( req.user && req.user.role === 'organizer') {
    return next();
  }

  var whiteList = [
    'firstName',
    'lastName',
    'email',
    'password'
  ];

  req.body = _.pick(req.body, whiteList);
  next();
}