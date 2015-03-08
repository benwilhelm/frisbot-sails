/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
  index: function(req, res){
    var now = new Date();
    Game.find({gameTime: {">=": now}}, function(err, games){
      if (err) return res.serverError(err)
      return res.json(games)
    })
  },

  rsvp: function(req, res) {
    var params = {};
    params.gameId = req.param('gameId');
    params.playing = req.body.playing;
    if (req.session.user) {
      params.userId = req.session.user;
    } else {
      params.userId = req.rsvpUserId;
    }
    
    Game.findOne(params.gameId, function(err, game){
      if (err) return res.serverError(err)

      Game.rsvp(params, function(err, game){
        if (err) return res.serverError(err)
        return res.json(game);
      })
    })
  },

  create: function(req, res){
    var params = _.pick(req.body, ['gameTime', 'pollingCutoff', 'locationName', 'address', 'minimumPlayers']);
    params.organizer = req.session.user;
    Game.create(params, function(err, game){
      if (err) return res.serverError(err);

      res.json(game);
    })
  }

};

