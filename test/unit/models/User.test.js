var should = require('should')
  , Barrels = require('barrels')
  , barrels = new Barrels('./test/fixtures')
  , _ = require('underscore')
  ;


describe("User Model", function() {
  
  describe("attributes and validations", function(){

    it("should require firstName", function(done){
      var params = testParams();
      delete params.firstName;
      User.create(params, function(err, user) {
        err.invalidAttributes.firstName.length.should.be.above(0);
        should(user).eql(undefined)
        done();
      });
    });

    it("should require lastName", function(done){
      var params = testParams();
      delete params.lastName;
      User.create(params, function(err, user) {
        err.invalidAttributes.lastName.length.should.be.above(0);
        should(user).eql(undefined)
        done();
      });
    });

    it("should require email", function(done){
      var params = testParams();
      delete params.email;
      User.create(params, function(err, user) {
        err.invalidAttributes.email.length.should.be.above(0);
        should(user).eql(undefined)
        done();
      });
    });

    it("should require email to be unique", function(done){
      barrels.populate(['user'], function(){
        var params = testParams({email: 'admin@test.com'});
        User.create(params, function(err, user){
          var emailErr = err.invalidAttributes.email[0];
          emailErr.message.should.match(/A record with that `email` already exists/);
          should(user).eql(undefined);
          done();
        })
      })
    });
   
    it("should require password", function(done) {
      var params = testParams();
      delete params.password;
      User.create(params, function(err, user){
        err.invalidAttributes.password.length.should.be.above(0);
        should(user).eql(undefined);
        done();
      })
    });

    it("should strip password on toJSON", function(done){
      var params = testParams();
      User.create(params)
      .then(function(user){
        user.password.should.be.a.String;   
        user.password.length.should.be.above(25);
        should(user.toJSON().password).eql(undefined);
        done();
      })
    })

  })

  describe("lifecycle hooks", function(){

    beforeEach(function(done){
      barrels.populate(['user'], done)
    })

    it("should hash password on creation", function(done) {
      var params = testParams();
      User.create(params, function(err, user){
        Util.isBcrypted(user.password).should.be.true;
        done();
      })
    });

    it("should not rehash existing password on update", function(done){
      User.findOne(1, function(err, user){
        var initialPassword = user.password;
        Util.isBcrypted(initialPassword).should.be.true;

        user.firstName = "Benjamin";
        user.save(function(err, user){
          user.password.should.eql(initialPassword);
          done();
        })
      })
    });

    it("should hash new password on update", function(done){
      User.findOne(1, function(err, user){
        var initialPassword = user.password;
        Util.isBcrypted(initialPassword).should.be.true;

        user.password = "newpassword";
        user.save(function(err, user){
          Util.isBcrypted(user.password).should.be.true;
          user.password.should.not.eql(initialPassword);
          done();
        })
      })
    })

  })

  describe("verifyCredentials method", function(){

    beforeEach(function(done){
      barrels.populate(['user'], done)
    })

    it("should return user for matching password", function(done){
      User.verifyCredentials({
        email: 'admin@test.com',
        password: 'admin_password'
      }, function(err, user){
        should(err).be.null;
        user.email.should.eql('admin@test.com');
        done();
      })
    });

    it("should return false for no user found", function(done){
      User.verifyCredentials({
        email: 'admin@toast.com',
        password: 'admin_password'
      }, function(err, match){
        should(err).be.null;
        match.should.be.false;
        done();
      })
    });

    it("should return false for non-matching password", function(done){
      User.verifyCredentials({
        email: 'admin@test.com',
        password: 'wrong_password'
      }, function(err, match){
        should(err).be.null;
        match.should.be.false;
        done();
      })
    });
  })

})


testParams = function(overrides) {
  return _.extend({
      firstName: 'first',
      lastName: 'last',
      email: 'firstlast@test.com',
      password: 'unencrypted'
    }, overrides);
}