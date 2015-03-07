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
      if (err) return Util.errorResponse(err, res);
      return res.json(games)
    })
  },

  rsvp: function(req, res) {
    var params = {};
    params.gameId = req.param('id');
    params.playing = req.body.playing;
    if (req.session.user) {
      params.userId = req.session.user;
    }
    
    Game.findOne(params.gameId, function(err, game){
      if (err) return Util.errorResponse(err, res);

      Game.rsvp(params, function(err, game){
        if (err) return Util.errorResponse(err, res);
        return res.json(game);
      })
    })
  }


};

