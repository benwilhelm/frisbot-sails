var authHelper = require('../../helpers/auth')
  , Barrels = require('barrels')
  , barrels = new Barrels('./test/fixtures')
  , should = require('should')
  , request = require('supertest')
  ;

describe("Users Controller", function(){

  beforeEach(function(done){
    barrels.populate(['user'], done)
  })

  describe("#index action", function(){
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
          if (err) throw err;
          res.body.length.should.eql(4);
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
          if (err) throw err;
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
          if (err) throw err;
          var ids = _.map(res.body, function(usr) { return usr.id })
          ids.length.should.eql(1);
          ids.should.eql([3])
          done();
        })
      })
    })
  })

  describe("#show action", function(){
    it("should require authentication", function(done){
      request(sails.hooks.http.app)
      .get('/users/2')
      .expect(403)
      .end(done)
    })

    it("should return own account for logged in user", function(done){
      agent = request.agent(sails.hooks.http.app);
      authHelper.loginPlayer(agent, function(err, res){
        agent
        .get('/users/2')
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          res.body.email.should.eql('player@test.com')
          done();
        })
      })
    })

    it("should return 403 when non-organizer tries to view another user", function(done){
      agent = request.agent(sails.hooks.http.app);
      authHelper.loginPlayer(agent, function(err, res){
        agent
        .get('/users/1')
        .expect(403)
        .end(done);
      })
    })

    it("should return any user for organizer", function(done){
      agent = request.agent(sails.hooks.http.app);
      authHelper.loginAdmin(agent, function(err, res){
        agent
        .get('/users/2')
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          res.body.email.should.eql('player@test.com')
          done();
        })
      })
    })

    it("should return 404 for non-existent user", function(done){
      agent = request.agent(sails.hooks.http.app);
      authHelper.loginAdmin(agent, function(err, res){
        agent
        .get('/users/25')
        .expect(404)
        .end(done);
      })
    })
  })

  describe("#create action", function(){
    it("should create new, unverified user", function(done){
      
      var params = testParams();
      
      request(sails.hooks.http.app)
      .post('/users')
      .send(params)
      .expect(200)
      .end(function(err, res){
        if (err) throw err;
        res.body.id.should.be.above(0);
        res.body.firstName.should.eql(params.firstName);
        res.body.lastName.should.eql(params.lastName);
        res.body.email.should.eql(params.email);
        res.body.verified.should.eql(false)
        should(res.body.password).eql(undefined);
        done();
      })
    })

    it("should fail with missing parameters", function(done){
      var params = testParams();
      delete params.firstName;

      request(sails.hooks.http.app)
      .post('/users')
      .send(params)
      .expect(412)
      .end(done)
    })
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


testParams = function(overrides) {
  return _.extend({
      firstName: 'New',
      lastName: 'User',
      email: 'new@test.com',
      password: 'new_password'
    }, overrides);
}