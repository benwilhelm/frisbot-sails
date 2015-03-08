module.exports = function(req, res, next) {

  if (!req.session.user) return res.forbidden()

  User.findOne(req.session.user, function(err, user){
    if (err) res.serverError(err);

    if (user.role.toLowerCase() === 'organizer') {
      return next();
    }

    return res.forbidden();
  })
}