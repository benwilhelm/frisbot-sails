var Barrels = require('barrels')
  , barrels = new Barrels('./test/fixtures')
  , should = require('should')
  , sinon = require('sinon')
  , _ = require('underscore')
  ;

describe("User Model", function() {

  beforeEach(function(done){
    barrels.populate(['user'], done)
  });
  
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
        user.password.should.be.type('string');   
        user.password.length.should.be.above(25);
        should(user.toJSON().password).eql(undefined);
        done();
      })
    })

    it("should emit 'User.created'", function(done){
      var params = testParams();
      var eventStub = sinon.stub(Evt, 'emit');
      User.create(params, function(err, user){
        if (err) throw err;
        setTimeout(function(){
          eventStub.calledWith("User.created").should.eql(true)
          eventStub.restore();
          done();
        });
      })
    })

  })

  describe("lifecycle hooks", function(){

    beforeEach(function(done){
      barrels.populate(['user'], done)
    })

    it("should hash password and create verificationCode on creation", function(done) {
      var params = testParams();
      User.create(params, function(err, user){
        Util.isBcrypted(user.password).should.eql(true);
        user.verificationCode.should.match(/^[\w\d]{10}$/)
        done();
      })
    });

    it("should not rehash existing password on update", function(done){
      User.findOne(1, function(err, user){
        var initialPassword = user.password;
        Util.isBcrypted(initialPassword).should.eql(true);

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
        Util.isBcrypted(initialPassword).should.eql(true);

        user.password = "newpassword";
        user.save(function(err, user){
          Util.isBcrypted(user.password).should.eql(true);
          user.password.should.not.eql(initialPassword);
          done();
        })
      })
    });

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
        should(err).eql(null);
        user.email.should.eql('admin@test.com');
        done();
      })
    });

    it("should return false for no user found", function(done){
      User.verifyCredentials({
        email: 'admin@toast.com',
        password: 'admin_password'
      }, function(err, match){
        should(err).eql(null);
        match.should.eql(false);
        done();
      })
    });

    it("should return false for non-matching password", function(done){
      User.verifyCredentials({
        email: 'admin@test.com',
        password: 'wrong_password'
      }, function(err, match){
        should(err).eql(null);
        match.should.eql(false);
        done();
      })
    });

    it("should lock account after 5 unsuccessful attempts")
  });

  describe("verify method", function(){
    it("should set `verified` to true, delete verificationCode, and emit `Users.verified`", function(done){
      var eventStub = sinon.stub(Evt, 'emit');

      User.findOne(4, function(err, user){
        console.error(err);
        if (err) throw err;
        var verCode = user.verificationCode;
        user.verified.should.eql(false)

        User.verify({userId: 4, verificationCode: verCode}, function(err, user){
          should(err).eql(null)
          user.verified.should.eql(true);
          should(user.verificationCode).eql(null);
          eventStub.calledWith('User.verified', user).should.eql(true);
          Evt.emit.restore();
          done()
        })
      })
    });

    it("should return error with bad verificationCode", function(done){
      User.verify({userId:4, verificationCode: 'bad_code'}, function(err, user){
        should(user).eql(undefined);
        err.code.should.eql("E_BAD_CREDENTIALS");
        err.message.should.eql("incorrect verificationCode")
        done();
      })
    })

    it("should fail with null verificationCode regardless", function(done){
      User.update(4, {verified: false, verificationCode: null}, function(err, user){
        if (err) throw err;

        User.verify({userId: 4, verificationCode: null}, function(err, user){
          should(user).eql(undefined);
          err.code.should.eql("E_MISSING_PARAM")
          err.message.should.eql("`verify` method requires userId and vericationCode parameters");
          done();
        })
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