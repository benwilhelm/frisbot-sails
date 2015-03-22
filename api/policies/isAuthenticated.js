/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.user`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.userId) {
    
    return User.findOne(req.session.userId, function(err, user){

      if (err)   
        return res.serverError(err);

      if (!user) 
        return res.forbidden("You are not permitted to perform this action.");
      
      if (!user.verified)
        return res.forbidden("You have not verified your account.")

      if (user.suspended)
        return res.redirect('/logout')

      req.user = user;
      return next();
    })
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
};
