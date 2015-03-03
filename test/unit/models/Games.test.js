var Barrels = require('barrels')
  , barrels = new Barrels('./test/fixtures')
  , moment = require('moment')
  , should = require('should')
  , _ = require('underscore')
  ;




describe("Game Model", function() {

  describe("validators", function(){
    it("should save with expected params", function(done) {
      var params = testParams();
      Game.create(params)
      .then(function(game){
        game.locationName.should.eql("River Park");
        done();
      })
    });

    it('should require an organizer', function(done){
      var params = testParams();
      delete params.organizer;
      Game.create(params, function(err, game){
        should(game).eql(undefined);
        err.invalidAttributes.organizer.length.should.be.above(0);
        done();
      })
    });

    it("should require organizer to have organizer role")

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

    it("should create rsvp hash object of the form {hash: userId}", function(done){
      barrels.populate(function(){
        var params = testParams();
        Game.create(params, function(err, game){
          game.rsvpHashes.should.be.an.Object;
          _.values(game.rsvpHashes).sort().should.eql([1,2]);
          done();
        })
      }, false)
    })

    it("should strip rsvp hash object from toJSON", function(done){
      var params = testParams();
      Game.create(params, function(err, game){
        game.rsvpHashes.should.be.an.Object;
        should(game.toJSON().rsvpHashes).eql(undefined);
        done();
      })
    })
  });
  
  describe("rsvp method", function() {

    beforeEach(function(done){
      barrels.populate(done, false);
    })

    // not sure how to implement this test, since I can't save
    // a game with a pollingCutoff in the past
    it("should not allow rsvp after cutoff time");

    it("should add userId for 'yes' response to playing array", function(done) {
      Game.rsvp({gameId: 1, userId: 2, response: 'yes'}, function(err, game){
        game.playing.should.eql([2]);
        game.notPlaying.should.eql([]);
        done();
      })
    });

    it("should add userId for 'no' response to no array", function(done) {
      Game.rsvp({gameId: 2, userId: 2, response: 'no'}, function(err, game){
        game.notPlaying.should.eql([2]);
        game.playing.should.eql([]);
        done();
      })
    });

  });

  describe("playersNeeded method", function(){

    it("should return difference if playing.length is less than minimumPlayers", function(done){
      var params = testParams({playing: [1, 2, 3, 4]})
      Game.create(params, function(err, game){
        game.playersNeeded().should.eql(2);
        done();
      })
    });

    it("should return 0 if playing.length is greater than or equal to minimumPlayers", function(done){
      var params = testParams({playing: [1, 2, 3, 4, 5, 6]});
      Game.create(params, function(err, game){
        game.playersNeeded().should.eql(0)
        done();
      })
    });

  })

  describe("status method", function(){

    it("should return 'waiting' for too few players prior to cutoff", function(done){
      var params = testParams({playing: [1, 2, 3]});
      Game.create(params, function(err, game){
        game.status().should.eql('waiting')
        done();
      })
    });

    it("should return 'pending' for enough players prior to cutoff", function(done){
      var params = testParams({playing: [1, 2, 3, 4, 5, 6]});
      Game.create(params, function(err, game){
        game.status().should.eql('pending')
        done();
      })
    });

    // can't save model with prior cutoff. how to test?
    it("should return 'off' for too few players after cutoff", function(done) {
      var params = testParams({playing: [1, 2, 3]});
      Game.create(params, function(err, game){
        game.pollingCutoff = moment().subtract({days:1}).toDate();
        game.status().should.eql('off');
        done();
      })
    })

    // can't save model with prior cutoff. how to test?
    it("should return 'on' for enough players after cutoff", function(done) {
      var params = testParams({playing: [1, 2, 3, 4, 5, 6]});
      Game.create(params, function(err, game){
        game.pollingCutoff = moment().subtract({days:1}).toDate();
        game.status().should.eql('on');
        done();
      })
    });
  
  });

  describe("stillPolling method", function(){
    it("should return true if pollingCutoff is greater than Date.now()", function(done){
      var params = testParams();
      Game.create(params, function(err, game){
        game.stillPolling().should.eql(true);
        done();
      })
    });

    it("should return false if pollingCutoff is less than or equal to Date.now()", function(done){
      var params = testParams();
      Game.create(params, function(err, game){
        game.pollingCutoff = moment().subtract({days:1}).toDate();
        game.stillPolling().should.eql(false);
        done();
      })
    })

  })

})

function testParams(params) {
  params = params || {};
  var defaults = {
    organizer: 1,
    gameTime: moment().add({days: 3}).toDate(),
    pollingCutoff: moment().add({days:2, hours:12}).toDate(),
    locationName: "River Park",
    address: "Foster and Francisco, Chicago",
    minimumPlayers: 6,
    comment: "Who wants to play?"
  }

  return _.extend(defaults, params);
}
