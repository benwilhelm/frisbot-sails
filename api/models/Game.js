var moment = require("moment")
  , crypto = require('crypto')
  ;

/**
* Game.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {


  attributes: {
    organizer: {
      model: 'user',
      required: true
    },

    gameTime: {
      type: 'date',
      after: moment().subtract({seconds:3}).toDate(),
      required: true
    },

    pollingCutoff: {
      type: 'date',
      required: true,
      after: moment().subtract({seconds:3}).toDate(),
      before: function() {
        return this.gameTime;
      }
    },

    locationName: {
      type: 'string',
      required: true
    },

    address: {
      type: 'string',
      required: true
    },

    minimumPlayers: {
      type: 'integer',
      required: true
    },

    playing: {
      type: 'array',
      defaultsTo: []
    },

    notPlaying: {
      type: 'array',
      defaultsTo: []
    },

    rsvpHashes: {
      type: 'object',
      defaultsTo: {},
      protected: true
    },

    /**
     * Instance method
     * returns difference of playing.length if less than minimumPlayers,
     * otherwise returns 0
     */
    playersNeeded: function() {
      if (this.playing.length < this.minimumPlayers) {
        return this.minimumPlayers - this.playing.length;
      }

      return 0;
    },

    /**
     * Instance method
     * returns status of game based on number of players and pollingCutoff
     * "waiting" = too few players but polling still open
     * "pending" = enough players but polling still open
     * "on"      = enough players and polling closed
     * "off"     = too few players and polling closed
     */
    status: function() {

      if (this.playing.length < this.minimumPlayers
      && this.stillPolling()) {
        return 'waiting'
      }

      if (this.playing.length >= this.minimumPlayers
      && this.stillPolling()) {
        return 'pending'
      }

      if (this.playing.length >= this.minimumPlayers
      && !this.stillPolling()) {
        return 'on'
      }

      if (this.playing.length < this.minimumPlayers
      && !this.stillPolling()) {
        return 'off'
      }
    },

    stillPolling: function() {
      return this.pollingCutoff > Date.now();
    }
  },

  /**
   * returns all games with pollingCutoff in the future
   */
  findPending: function(cb) {
    var now = new Date();
    Game.find({pollingCutoff: {">": now}}, cb)
  },

  /**
   * Adds userId to appropriate response array for passed gameId
   */
  rsvp: function(params, callback) {
    var gameId = params.gameId;
    var userId = params.userId;
    var playing = params.playing || "";

    var responseProperty;
    switch (playing.toLowerCase()) {
      case 'yes':
        responseProperty = 'playing';
        break;
      case 'no':
        responseProperty = 'notPlaying';
        break;
      default:
        return callback(new Error("response paramater should be either 'yes' or 'no'"));
    }    

    Game.findOne(gameId, function(err, game) {
      if (err) return callback(err);
      if (!game) return callback(new Error("Game not found for id: " + gameId));
      if (game.pollingCutoff < Date.now()) return callback(new Error("Cannot rsvp to a game after its pollingCutoff"));

      User.findOne(userId, function(err, user){
        if (err) return callback(err);
        if (!user) return callback(new Error("User not found for id: " + userId));

        game[responseProperty].push(userId);
        game.save(callback);
      })
    })
  },

  beforeCreate: function(vals, done){
    User.find({}, function(err, users){
      users.forEach(function(user){
        var hash = crypto.randomBytes(8).toString('hex');
        vals.rsvpHashes[hash] = user.id;
      })
      done();
    })
  }
};

