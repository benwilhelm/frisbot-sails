var moment = require('moment')
  , should = require('should')
  , _ = require('underscore')
  ;


describe("Game Model", function() {

  it("should save with expected params", function(done) {
    var params = testParams();
    Game.create(params)
    .then(function(game){
      game.locationName.should.eql("River Park");
      done();
    })
  });

  it("should require a game date with time", function(done) {
    var params = testParams();
    delete params.gameTime;
    Game.create(params, function(err, game){
      should(game).eql(undefined);
      err.invalidAttributes.gameTime.length.should.be.above(0);
      done();
    })
  });

  it('should require gameTime to be in the future', function(done) {
    var params = testParams({ 
      gameTime: moment().subtract({days:2}).toDate(),
      pollingCutoff: moment().subtract({days:3}).toDate()
    })
    Game.create(params, function(err, game){
      should(game).eql(undefined);
      var gameTimeErr = err.invalidAttributes.gameTime;
      gameTimeErr.length.should.be.above(0);
      gameTimeErr[0].message.should.match(/\"after\" validation rule failed for input/)
      done();
    })
  });

  it("should require a polling cutoff date and time", function(done) {
    var params = testParams();
    delete testParams.pollingCutoff;
    Game.create(testParams, function(err, game) {
      should(game).eql(undefined);
      var pcErr = err.invalidAttributes.pollingCutoff;
      pcErr.length.should.be.above(0);
      pcErr[1].message.should.match(/required/);
      done();
    })
  })

  it("should require polling cutoff to be in the future", function(done) {
    var params = testParams({ 
      gameTime: moment().subtract({days:2}).toDate(),
      pollingCutoff: moment().subtract({days:3}).toDate()
    })
    Game.create(params, function(err, game){
      should(game).eql(undefined);
      var pcErr = err.invalidAttributes.pollingCutoff;
      pcErr.length.should.be.above(0);
      pcErr[0].message.should.match(/\"after\" validation rule failed for input/)
      done();
    })
  });
  
  it("should require cutoff prior to game time", function(done) {
    var params = testParams({ 
      gameTime: moment().subtract({days:2}).toDate()
    })
    Game.create(params, function(err, game){
      should(game).eql(undefined);
      var pcErr = err.invalidAttributes.pollingCutoff;
      pcErr.length.should.be.above(0);
      pcErr[0].message.should.match(/\"before\" validation rule failed for input/)
      done();
    })
  })
  
  it("should require a locationName", function(done) {
    var params = testParams();
    delete params.locationName;
    Game.create(params, function(err, game) {
      should(game).eql(undefined);
      var attErr = err.invalidAttributes.locationName;
      attErr.length.should.be.above(0);
      attErr[1].message.should.match(/required/);
      done();
    })
  });

  it("should require an address", function(done) {
    var params = testParams();
    delete params.address;
    Game.create(params, function(err, game) {
      should(game).eql(undefined);
      var attErr = err.invalidAttributes.address;
      attErr.length.should.be.above(0);
      attErr[1].message.should.match(/required/);
      done();
    })
  })
  
  it("should require minimumPlayers", function(done) {
    var params = testParams();
    delete params.minimumPlayers;
    Game.create(params, function(err, game) {
      should(game).eql(undefined);
      var attErr = err.invalidAttributes.minimumPlayers;
      attErr.length.should.be.above(0);
      attErr[1].message.should.match(/required/);
      done();
    })
  });
  
  it("should require minimumPlayers to be integer", function(done) {
    var params = testParams({minimumPlayers: 'foo'});
    Game.create(params, function(err, game) {
      should(game).eql(undefined);
      var attErr = err.invalidAttributes.minimumPlayers;
      attErr.length.should.be.above(0);
      attErr[0].message.should.match(/integer/);
      done();
    })
  });
  
  describe("rsvp method", function() {

    // not sure how to implement this test, since I can't save
    // a game with a pollingCutoff in the past
    it("should not allow rsvp after cutoff time");

    it("should add userId for 'yes' response to attending array", function(done) {
      Game.rsvp({gameId: 1, userId: 2, response: 'yes'}, function(err, game){
        game.attending.should.eql([2]);
        game.notAttending.should.eql([]);
        done();
      })
    });

    it("should add userId for 'no' response to no array", function(done) {
      Game.rsvp({gameId: 2, userId: 2, response: 'no'}, function(err, game){
        game.notAttending.should.eql([2]);
        game.attending.should.eql([]);
        done();
      })
    });

  });


})

function testParams(params) {
  params = params || {};
  var defaults = {
    gameTime: moment().add({days: 3}).toDate(),
    pollingCutoff: moment().add({days:2, hours:12}).toDate(),
    locationName: "River Park",
    address: "Foster and Francisco, Chicago",
    minimumPlayers: 6,
    comment: "Who wants to play?"
  }

  return _.extend(defaults, params);
}
