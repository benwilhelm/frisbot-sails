var should = require('should')
  , Barrels = require('barrels')
  , barrels = new Barrels('./test/fixtures')
  , _ = require('underscore')
  ;

before(function(done){
  User.destroy({}, function(){
    barrels.populate(done)
  })
})

describe("User Model", function() {

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
    var params = testParams({email: 'admin@test.com'});
    User.create(params, function(err, user){
      var emailErr = err.invalidAttributes.email[0];
      emailErr.message.should.match(/A record with that `email` already exists/);
      should(user).eql(undefined);
      done();
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

  it("should hash password on creation", function(done) {
    var params = testParams();
    User.create(params) 
    .then(function(user) {
      user.password.length.should.be.above(16)
      done();
    })
    .catch(function(err){
      console.error(err);
      done();
    })
  });

  it("should strip password on toJSON", function(done){
    var params = testParams({email:'firstlast2@test.com'});
    User.create(params)
    .then(function(user){
      should(user.toJSON().password).eql(undefined);
      done();
    })
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