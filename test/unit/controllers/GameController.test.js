var authHelper = require('../../helpers/auth.js') 
  , Barrels = require('barrels')
  , barrels = new Barrels('./test/fixtures')
  , request = require('supertest')
  , should = require('should')
  , _ = require("underscore")
  ;

describe("GamesController", function(){

  beforeEach(function(done){
    barrels.populate(['user'], function(){
      barrels.populate(['game'], done, false)
    }, false);
  })

  describe("#index action", function(){
    it('should respond with all future games', function(done){
      request(sails.hooks.http.app)
      .get('/games')
      .expect(200)
      .end(function(err, resp){
        resp.body.length.should.eql(2);
        done();
      })
    })
  });

  describe("#show action", function(){
    it("should respond with game corresponding to :id param", function(done){
      request(sails.hooks.http.app)
      .get('/games/2')
      .expect(200)
      .end(function(err, resp){
        if (err) throw err;
        should(err).eql(null);
        resp.body.gameTime.toString().should.eql('2017-03-08T16:55:13.000Z');
        done();
      })
    })
  });

  describe("#rsvp action", function(){
    it("should require logged in user or correct hashkey", function(done){
      request(sails.hooks.http.app)
      .post('/games/2/rsvp')
      .send({userId: 1, resp: 'yes'})
      .expect(403)
      .end(done);
    })

    it("should allow rsvp to logged in user", function(done){
      var agent = request.agent(sails.hooks.http.app);
      authHelper.login(agent, {
        email: 'player@test.com',
        password: 'player_password'
      }, function(err, res){
        res.status.should.eql(200);
        agent
        .post('/games/2/rsvp')
        .send({playing: 'yes'})
        .end(function(err, res){
          res.status.should.eql(200);
          res.body.playing.should.eql([2]);
          done();
        })
      })
    })

    it('should allow rsvp with correct hashkey', function(done){
      Game.findOne({id:2}, function(err, game){
        var hashkey = _.invert(game.rsvpHashes)[2];

        request(sails.hooks.http.app)
        .post('/games/2/rsvp')
        .send({playing: "no", hashkey: hashkey})
        .end(function(err, res){
          res.status.should.eql(200);
          res.body.notPlaying.should.eql([2]);
          done();
        })
      })
    })
  })

  describe("#create action", function(){
    it("should return 403 if user not logged in", function(done){
      request(sails.hooks.http.app)
      .post('/games')
      .send({})
      .expect(403)
      .end(done);
    })

    it("should return 403 if user does not have oragnizer role", function(done){
      var agent = request.agent(sails.hooks.http.app);
      authHelper.login(agent, {
        email: 'player@test.com',
        password: 'player_password'
      }, function(err, res){
        res.headers["set-cookie"][0].should.match(/user\=2/);
        
        agent
        .post('/games')
        .send({})
        .expect(403)
        .end(done);
      })
    })

    it("should set organizer to logged-in user and respond with newly created game", function(done){
      var agent = request.agent(sails.hooks.http.app);
      authHelper.login(agent, {
        email: 'admin@test.com',
        password: 'admin_password'
      }, function(err, res){ 
        var params = testParams();  
        agent
        .post('/games')
        .send(params)
        .expect(200)
        .end(function(err, res){
          res.body.gameTime.should.eql("2017-03-15T16:55:13.000Z");
          res.body.organizer.should.eql(1);
          done();
        });
      })      
    });

    it('should respond with useful error messages if invalid')
    it("should send rsvp email to all players")
  });

  describe("#update action", function(){
    it('should return 403 if user is not logged in')
    it('should return 403 if user does not have organizer role')
    it('should respond with updated game')
    it("should notify players of gameTime/pollingCutoff changes")
    it('should respond with useful error messages if invalid')
  })

  describe("#destroy action", function(){
    it('should require logged in user with organizer role')
    it('should delete game from database')
    it('should notify players')
  })

})


function testParams(params) {
  params = params || {};
  var defaults = {
    gameTime: "Wed Mar 15 2017 10:55:13 GMT-600 (CST)",
    pollingCutoff: "Tue Mar 14 2017 10:55:13 GMT-600 (CST)",
    locationName: "Winnemac Park",
    address: "Foster and Damen, Chicago",
    minimumPlayers: 6,
    comment: "Comment!"
  }
  return _.extend(defaults, params)
}