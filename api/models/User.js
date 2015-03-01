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
    }
  },

  beforeCreate: function(atts, next) {
    var bcrypt = require('bcrypt');
    bcrypt.genSalt(10, function(err, salt){
      if (err) return next(err);

      bcrypt.hash(atts.password, salt, function(err, hashed) {
        if (err) return next(err);

        atts.password = hashed;
        next();
      })
    })
  },

  verifyCredentials: function(params, cb) {
    var bcrypt = require('bcrypt');
    User.findOneByEmail(params.email)
    .then(function(user){
      bcrypt.compare(params.password, user.password, cb);
    })
    .catch(cb);
  }
};

