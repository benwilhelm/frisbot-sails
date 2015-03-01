var Sails = require('sails')
  , sails
  ;

before(function(done){

  var conf = require('../config/env/testing.js');
  Sails.lift(conf, function(err, server){
    sails = server;
    if (err) return done(err);
    done(err, sails);
  });
})

after(function(done){
  sails.lower(done);
})