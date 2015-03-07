var authHelper = require('../../helpers/auth.js') 
  , Barrels = require('barrels')
  , barrels = new Barrels('./test/fixtures')
  , request = require('supertest')
  , should = require('should')
  ;

describe("GamesController", function(){

  beforeEach(function(done){
    barrels.populate(['user', 'game'], done, false);
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
        .expect(200)
        .end(function(err, res){
          res.body.playing.should.eql([2]);
          done();
        })
      })
    })

    it('should allow rsvp with correct hashkey')
    it("should add user's id to playing array if rsvp is yes")
    it("should add user's id to notPlaying array if rsvp is no")
  })

  describe("#create action", function(){
    it('should require logged in user with organizer role')
    it("should send rsvp email to all players")
    it("should create new game")
    it("should respond with newly created game")
    it('should respond with useful error messages if invalid')
  });

  describe("#update action", function(){
    it('should require logged in user with organizer role')
    it('should update game in database')
    it("should notify players of gameTime/pollingCutoff changes")
    it('should respond with useful error messages if invalid')
  })

  describe("#destroy action", function(){
    it('should require logged in user with organizer role')
    it('should delete game from database')
    it('should notify players')
  })

})