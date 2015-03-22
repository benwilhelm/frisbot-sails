var authHelper = require('../../helpers/auth')
  , Barrels = require('barrels')
  , barrels = new Barrels(process.cwd() + '/test/fixtures')
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
    });

    it("should not allow creation with non-whitelisted params", function(done){
      var params = testParams({role: 'organizer'});

      request(sails.hooks.http.app)
      .post('/users')
      .send(params)
      .expect(200)
      .end(function(err, res){
        if (err) throw err;
        res.body.id.should.be.above(0);
        res.body.role.should.eql('player')
        done();
      })
    })

    it("should fail with missing params and send error messages", function(done){
      var params = testParams();
      delete params.firstName;

      request(sails.hooks.http.app)
      .post('/users')
      .send(params)
      .expect(412)
      .end(function(err, res){
        if (err) throw err;
        res.body.invalidAttributes.firstName.length.should.be.above(0);
        res.body.invalidAttributes.firstName[1].message.should.match(/required/)
        done();
      })
    })
  })

  describe("#update action", function(){
    it("should require authentication", function(done){
      request(sails.hooks.http.app)
      .post('/users/2')
      .send({})
      .expect(403)
      .end(done);
    })
    it("should update own account for non-organizer", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'player@test.com',
        password: 'player_password'
      }, function(err, res){
        if (err) throw err;
        agent
        .post('/users/2')
        .send({firstName: "Updated"})
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          res.body.id.should.eql(2);
          res.body.firstName.should.eql("Updated")
          done();
        })
      })
    })

    it('should not allow player role to update non-whitelisted attributes', function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'player@test.com',
        password: 'player_password'
      }, function(err, res){
        if (err) throw err;
        agent
        .post('/users/2')
        .send({role: "organizer", suspended:true, verified: false})
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          res.body.id.should.eql(2);
          res.body.role.should.eql("player")
          res.body.verified.should.eql(true)
          res.body.suspended.should.eql(false)
          done();
        })
      })
    })

    it("should return 403 for non-organizer if updating another account", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'player@test.com',
        password: 'player_password'
      }, function(err, res){
        if (err) throw err;
        agent
        .post('/users/1')
        .send({})
        .expect(403)
        .end(done)
      })
    })

    it("should allow organizer to update other accounts, including protected properties", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'admin@test.com',
        password: 'admin_password'
      }, function(err, res){
        if (err) throw err;
        agent
        .post('/users/2')
        .send({firstName: "Updated", suspended: true})
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          res.body.id.should.eql(2);
          res.body.firstName.should.eql("Updated")
          res.body.suspended.should.eql(true);
          done();
        })
      })
    })

    it("should return 404 for non-existent account", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'admin@test.com',
        password: 'admin_password'
      }, function(err, res){
        if (err) throw err;
        agent
        .post('/users/300')
        .send({})
        .expect(404)
        .end(done)
      })
    })
  })

  describe("#verify action", function(){
    it("should set `verified` = true with correct verificationCode", function(done){
      User.findOne(4, function(err, user){
        var vc = user.verificationCode;
        request(sails.hooks.http.app)
        .get("/users/4/verify/" + vc)
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          res.body.verified.should.eql(true);
          should(res.body.verificationCode).eql(null)
          done();
        })
      })
    })

    it("should return 403 with bad verificationCode", function(done){
      request(sails.hooks.http.app)
      .get("/users/4/verify/bad_code")
      .expect(403)
      .end(done);
    })
  })

  describe("#destroy action", function(){
    it("should require authentication", function(done){
      request(sails.hooks.http.app)
      .del("/users/2")
      .expect(403)
      .end(done);
    })

    it("should allow any user to destroy self", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'player@test.com',
        password: 'player_password'
      }, function(err, res){
        if (err) throw err;
        agent
        .del('/users/2')
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          res.body.id.should.eql(2);
          res.body.firstName.should.eql("Ultimate")
          done();
        })
      })
    })

    it("should return 403 for player attempting to destroy other user", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'player@test.com',
        password: 'player_password'
      }, function(err, res){
        if (err) throw err;
        agent
        .del('/users/1')
        .expect(403)
        .end(done)
      })
    })

    it("should allow organizer to destroy other users", function(done){
      var agent = request.agent(sails.hooks.http.app)
      authHelper.login(agent, {
        email: 'admin@test.com',
        password: 'admin_password'
      }, function(err, res){
        if (err) throw err;
        agent
        .del('/users/2')
        .expect(200)
        .end(function(err, res){
          if (err) throw err;
          res.body.id.should.eql(2);
          res.body.firstName.should.eql("Ultimate")
          done();
        })
      })
    })
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
