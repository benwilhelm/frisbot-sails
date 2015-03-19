var async = require('async')
  , mandrill = require('mandrill-api/mandrill')
  , MANDRILL_API_KEY = process.env.MANDRILL_API_KEY || ''
  , mandrillClient = new mandrill.Mandrill(MANDRILL_API_KEY)
  ;


module.exports = {
  
  sendUserVerification: function(user, callback){
    if (callback) callback(err, true)
  },

  sendGameInvite: function(game, users, callback) {
    async.parallel({
      game:  function(cb) { cb(); },
      users: function(cb) { cb(); }
    }, function(err, rslt){
      if (callback) callback(err, rslt);
    });
  }

}


/** 
 * Global Event Subscriptions
 */
sails.on("Game.created", function(game){
  User.findActive(function(err, users){
    if (err) sails.emit("Mail.error", err);
    Mail.sendGameInvite(game, users); 
  })
})

sails.on("User.created", function(user){
  Mail.sendUserVerification(user);
})

sails.on("User.verified", function(user){
  Game.findPending(function(err, games){
    if (err) sails.emit("Mail.error", err);
    games.forEach(function(game){
      Mail.sendGameInvite(game, [user]);
    })
  })
})
