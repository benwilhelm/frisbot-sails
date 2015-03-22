/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
  find: function(req, res){
    var now = new Date();
    Game.find({gameTime: {">=": now}}, function(err, games){
      if (err) return res.serverError(err)
      return res.json(games)
    })
  },

  findOne: function(req, res){
    Game.findOne(req.param('gameId'), function(err, game){
      if (err)   return res.serverError(err);
      if (!game) return res.notFound();
      return res.json(game);
    })
  },

  create: function(req, res){
    var params = whiteListParams(req.body)
    params.organizer = req.user;
    Game.create(params, function(err, game){
      if (err) return res.serverError(err);

      res.json(game);
    })
  },

  update: function(req, res) {
    var params = whiteListParams(req.body)
    var gameId = req.param('gameId');
    Game.update(gameId, params, function(err, games){
      if (err && err.code === 'E_VALIDATION')
        return res.validationError(err);

      if (err)
        return res.serverError(err);

      if (!games.length)
        return res.notFound();

      res.json(games[0]);
    })
  },

  destroy: function(req, res){
    var gameId = req.param('gameId');
    Game.findOne(gameId, function(err, game){
      if (err) return res.serverError(err);
      if (!game) return res.notFound();

      game.destroy(function(err){
        if (err) return res.serverError(err);
        res.json(game);
      })
    })
  },

  rsvp: function(req, res) {
    var params = {};
    params.gameId = req.param('gameId');
    params.playing = req.body.playing;
    params.userId = req.user.id;
    
    Game.findOne(params.gameId, function(err, game){
      if (err) return res.serverError(err)

      Game.rsvp(params, function(err, game){
        if (err) return res.serverError(err)
        return res.json(game);
      })
    })
  },

  rsvpByMail: function(req, res){
    var params = {
      gameId  : req.param('gameId'),
      playing : req.param('playing'),
      userId  : req.rsvpUserId // set in hasRsvpCredentials policy
    }

    var redirect = req.param('redirect')

    Game.findOne(params.gameId, function(err, game){
      if (err) return res.serverError(err);

      Game.rsvp(params, function(err, game){
        var loc = redirect || "/"
        res.redirect(301, loc);
      })
    })

  }


};


function whiteListParams(params) {
  return _.pick(params, ['gameTime', 'pollingCutoff', 'locationName', 'address', 'minimumPlayers']);
}
