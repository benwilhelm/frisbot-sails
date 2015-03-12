var async = require('async')
  , mandrill = require('mandrill-api/mandrill')
  , MANDRILL_API_KEY = process.env.MANDRILL_API_KEY || ''
  , mandrillClient = new mandrill.Mandrill(MANDRILL_API_KEY)
  ;


module.exports = {
  sendInvite: function(gameId, users) {
    async.parallel({
      game:  function(cb){ cb(); },
      users: function(cb) { cb(); }
    }, function(err, rslt){

    });
  }  
}