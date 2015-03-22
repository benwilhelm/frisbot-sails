var Barrels = require("barrels")
  , barrels = new Barrels(process.cwd() + '/test/fixtures')
  , should = require('should')
  , sinon = require('sinon')
  , _ = require('lodash')
  ;

describe("MailService", function(){

  beforeEach(function(done){
    barrels.populate(['user'], function(){
      barrels.populate(['game'], done, false);
    }, false);
  })

  describe("event handlers", function(){
    beforeEach(function(done){
      sinon.stub(Mail, 'sendGameInvite')
      sinon.stub(Mail, 'sendUserVerification')
      done();
    })

    afterEach(function(done){
      Mail.sendGameInvite.restore();
      Mail.sendUserVerification.restore();
      done();
    })

    it("should sendGameInvite to active players on sails.Game.created", function(done){
      Game.findOne(1, function(err, game){
        sails.emit('Game.created', game)
        _.defer(function(){
          Mail.sendGameInvite.calledOnce.should.eql(true);
          Mail.sendGameInvite.calledWith(game, sinon.match.array).should.eql(true);
          done();
        })
      })
    })

    it("should sendGameInvite on sails.User.verified if games pending", function(done){
      User.findOne(4, function(err, user){
        sails.emit('User.verified', user);
        _.defer(function(){
          Mail.sendGameInvite.called.should.eql(true);
          Mail.sendGameInvite.calledWith(sinon.match.object, sinon.match.has('length', 1)).should.eql(true);
          done();
        })
      })
    })

    it("should sendUserVerification on sails.User.created", function(done){
      var params = userParams();
      User.create(params, function(err, user){
        _.defer(function(){
          Mail.sendUserVerification.calledOnce.should.eql(true);
          Mail.sendUserVerification.calledWith(sinon.match.has('email','firstlast@test.com')).should.eql(true);
          done();
        })
      })
    })
  })

  describe("sendUserVerification method", function(){
    it("should send to passed user")
    it("should include link to verify account, including verificationCode")
  })

  describe("sendGameInvite method", function(){
    it("should send invitation to all users passed to method")
    it("should include gametime, location, polling cutoff time, and organizer comment")
    it("should include links for yes/no, with game-and-user-specific hashkey")
  })

  describe("sendGameReminder method", function(){
    it("should send to all users passed to method")
    it("should include current count of players")
    it("should include template text")
    it('should include rsvp links with game-and-user-specific hashkeys')
  })

  describe("sendGameOn method", function(){
    it("should send to all users passed to method")
    it("should include current count of players")
    it("should include gametime and location")
    it("should include template text")
  })

  describe("sendGameOff method", function(){
    it("should send to all users passed to method")
    it("should include template text")
  })

})

function gameParams(params) {
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

function userParams(overrides) {
  return _.extend({
      firstName: 'first',
      lastName: 'last',
      email: 'firstlast@test.com',
      password: 'unencrypted'
    }, overrides);
}
