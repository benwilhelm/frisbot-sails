var authHelper = require('../../helpers/auth')
  , Barrels = require('barrels')
  , barrels = new Barrels('./test/fixtures')
  , request = require('supertest')
  ;

describe("Users Controller", function(){

  beforeEach(function(done){
    barrels.populate(['user'], done)
  })

  describe("#list action", function(){
    it("should require authentication", function(done){
      request(sails.hooks.http.app)
      .get('/users')
      .expect(403)
      .end(done);
    })

    it("should require organizer role", function(done){

      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'player@test.com',
        password: 'player_password'
      }, function(err, res){
        res.status.should.eql(200);

        agent
        .get('/users')
        .expect(403)
        .end(done);
      })
    })
    it("should list all users by default", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'admin@test.com',
        password: 'admin_password'
      }, function(err, res){
        agent
        .get('/users')
        .expect(200)
        .end(function(err, res){
          res.body.length.should.eql(3);
          done();
        })
      })
    })
    it("should list active users when passed status: active", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'admin@test.com',
        password: 'admin_password'
      }, function(err, res){
        agent
        .get('/users?status=active')
        .expect(200)
        .end(function(err, res){
          var ids = _.map(res.body, function(usr) { return usr.id })
          ids.sort();
          ids.length.should.eql(2);
          ids.should.eql([1,2])
          done();
        })
      })
    })
    it("should list suspended users when passed status: suspended", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'admin@test.com',
        password: 'admin_password'
      }, function(err, res){
        agent
        .get('/users?status=suspended')
        .expect(200)
        .end(function(err, res){
          var ids = _.map(res.body, function(usr) { return usr.id })
          ids.length.should.eql(1);
          ids.should.eql([3])
          done();
        })
      })
    })
  })

  describe("#show action", function(){
    it("should require authentication")
    it("should return user for logged in account")
    it("should require organizer role to view other users")
  })

  describe("#create action", function(){
    it("should create new, unverified user")
    it("should return useful error messages when applicable")
  })

  describe("#verify action", function(){
    it("should set :verified=true with correct authorization key")
  })

  describe("#destroy action", function(){
    it("should require authentication")
    it("should allow user to destroy self")
    it("should require organizer role to destroy other users")
  })

})