module.exports = function(req, res, next) {

  if (req.user && req.user.role.toLowerCase() === 'organizer') {
    return next();
  }

  return res.forbidden();
}