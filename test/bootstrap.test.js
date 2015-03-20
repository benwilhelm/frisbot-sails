var async = require('async')
  , Sails = require('sails')
  , sails
  ;

process.env.NODE_ENV = 'testing'

before(function(done){

  var conf = require('../config/env/testing.js');
  Sails.lift(conf, function(err, server){
    sails = server;
    if (err) {
      console.error(err);
      return done(err);
    }
    done(err, sails);
  });
})

after(function(done){
  async.parallel([
    function(cb) { User.destroy({}, cb)},
    function(cb) { Game.destroy({}, cb)}
  ], function(err){
    sails.lower(done);
  })
})