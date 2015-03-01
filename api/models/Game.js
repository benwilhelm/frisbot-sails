var moment = require("moment")
  // , _ = require('underscore')
  ;

/**
* Game.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
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

    attending: {
      type: 'array',
      defaultsTo: []
    },

    notAttending: {
      type: 'array',
      defaultsTo: []
    }
  },

  rsvp: function(params, callback) {
    var gameId = params.gameId;
    var userId = params.userId;
    var resp = params.response;

    var responseProperty;
    switch (resp.toLowerCase()) {
      case 'yes':
        responseProperty = 'attending';
        break;
      case 'no':
        responseProperty = 'notAttending';
        break;
      default:
        return callback(new Error("response paramater should be either 'yes' or 'no'"));
        break;
    }    

    Game.findOne(gameId, function(err, game) {
      if (err) return callback(err);
      if (!game) return callback(new Error("Game not found for id: " + gameId));
      if (game.pollingCutoff < Date.now()) return callback("Cannot rsvp to a game after its pollingCutoff");

      User.findOne(userId, function(err, user){
        if (err) return callback(err);
        if (!user) return callback(new Error("User not found for id: " + userId));

        game[responseProperty].push(userId);
        game.save(callback);
      })
    })
  }
};

