module.exports = function(req, res, next){
  if (req.session.user) return next();

  var gameId = req.param('gameId');
  var body = req.body || {};
  var hashkey = body.hashkey || req.param('hashkey');

  Game.findOne({id:gameId}, function(err, game){

    if (err)   
      return res.serverError(err);
    
    if (!game) 
      return res.notFound();
    
    if (!game.rsvpHashes[hashkey]) 
      return res.forbidden() 

    req.rsvpUserId = game.rsvpHashes[hashkey]
    return next();

  })
}