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
    var gameId = req.param('id')
    Game.findOne(gameId, function(err, game){
      if (err) return Util.errorResponse(err, res);

      return res.json(game);
    })
  }


};

