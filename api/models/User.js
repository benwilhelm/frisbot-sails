/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    firstName: {
      type: 'string',
      required: true
    },

    lastName: {
      type: 'string',
      required: true
    },

    email: {
      type: 'email',
      unique: true,
      required: true
    },

    password: {
      type: 'string',
      minLength: 8,
      required: true,
      protected: true
    },

    role: {
      type: 'string',
      enum: ['player', 'organizer']
    },

    suspended: {
      type: 'boolean',
      defaultsTo: false
    },

    verified: {
      type: 'boolean',
      defaultsTo: false
    }

  },

  beforeCreate: function(atts, next) {
    encryptPassword(atts.password, function(err, hashed){
      atts.password = hashed;
      next();
    })
  },

  beforeUpdate: function(atts, next) {
    if (!Util.isBcrypted(atts.password)) {
      encryptPassword(atts.password, function(err, hashed){
        atts.password = hashed;
        next();
      })
    } else {
      next();
    }
  },

  verifyCredentials: function(params, cb) {
    var bcrypt = require('bcrypt');
    User.findOneByEmail(params.email, function(err, user){
      if (err) return cb(err);
      if (!user) return cb(null, false)
        
      bcrypt.compare(params.password, user.password, function(err, match){
        if (err) return cb(err);

        var resp = match ? user : false;
        cb(null, resp);
      });
    });
  },

};

function encryptPassword(pw, cb) {
  var bcrypt = require('bcrypt');
  var workFactor = process.env.NODE_ENV === 'testing' ? 1 : 10;
  bcrypt.genSalt(workFactor, function(err, salt){
    if (err) return next(err);

    bcrypt.hash(pw, salt, function(err, hashed) {
      if (err) return next(err);
      cb(null, hashed);
    })
  })
}
