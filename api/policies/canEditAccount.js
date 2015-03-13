module.exports = function(req, res, next){

  var canEdit = false;
  var userId = parseInt(req.param('userId'), 10);

  if (req.user.id === userId)
    canEdit = true;

  if (req.user.role === 'organizer' )
    canEdit = true;


  if (canEdit)
    return next();


  return res.forbidden("You are not permitted to perform this operation")
}