var bcrypt = require('bcrypt')
  , crypto = require('crypto')
  , EventEmitter = require("events").EventEmitter
  , util = require('util')
  ;

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
      enum: ['player', 'organizer'],
      required: true,
      defaultsTo: 'player'
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
    atts.verificationCode = crypto.randomBytes(5).toString('hex');
    encryptPassword(atts.password, function(err, hashed){
      atts.password = hashed;
      next();
    })
  },

  afterCreate: function(user, next) {
    sails.emit('User.created', user)
    next();
  },

  beforeUpdate: function(atts, next) {
    if (atts.password && !Util.isBcrypted(atts.password)) {
      encryptPassword(atts.password, function(err, hashed){
        atts.password = hashed;
        next();
      })
    } else {
      next();
    }
  },

  afterUpdate: function(user, next) {
    sails.emit('User.updated', user)
    next();
  },

  findActive: function(cb) {
    User.find({
      verified  : true,
      suspended : false
    }, cb)
  },

  verifyCredentials: function(params, cb) {
    var bcrypt = require('bcrypt');
    User.findOneByEmail(params.email, function(err, user){
      if (err) return cb(err);
      if (!user) return cb(null, false)
      if (!user.verified) return cb(null, false)
      if (user.suspended) return cb(null, false);
        
      bcrypt.compare(params.password, user.password, function(err, match){
        if (err) return cb(err);

        var resp = match ? user : false;
        cb(null, resp);
      });
    });
  },

  verify: function(params, cb) {
    var userId = params.userId;
    var verKey = params.verificationCode;
    
    if (!userId || !verKey) {
      var err = new Error("`verify` method requires userId and vericationCode parameters");
      err.code = "E_MISSING_PARAM";
      return cb(err)
    }

    User.findOne(userId, function(err, user){
      if (err) return cb(err);
      
      verified = (verKey === user.verificationCode) 
      if (!verified) {
        err = new Error("incorrect verificationCode")
        err.code = "E_BAD_CREDENTIALS"
        return cb(err);
      }

      user.verified = true;
      user.verificationCode = null;
      user.save(function(err, user){
        if (err) return cb(err);

        sails.emit('User.verified', user)
        cb(null, user);
      });
    })
  }

};

function encryptPassword(pw, cb) {
  var workFactor = process.env.NODE_ENV === 'testing' ? 1 : 10;
  bcrypt.genSalt(workFactor, function(err, salt){
    if (err) return next(err);

    bcrypt.hash(pw, salt, function(err, hashed) {
      if (err) return next(err);
      cb(null, hashed);
    })
  })
}
