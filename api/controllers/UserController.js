var _ = require('lodash') ;

module.exports = {

  index: function(req, res){
    var query = {};
    if (req.param('status') == 'active') {
      query.suspended = false;
      query.verified = true;
    }

    if (req.param('status') == 'suspended') {
      query.suspended = true
    }

    User.find(query).sort('lastName').exec(function(err, users){
      if (err) res.serverError(err);
      res.json(users);
    })
  },

  show: function(req, res){
    var userId = req.param('userId');
    User.findOne(userId, function(err, user){
      
      if (err)   return res.serverError(err);
      if (!user) return res.notFound();

      res.json(user);

    })
  },

  create: function(req, res) {
    User.create(req.body, function(err, user){
    
      if (err && err.code === 'E_VALIDATION')
        return res.validationError(err);

      if (err)
        return res.serverError(err);

      res.json(user);
    })
  },

  update: function(req, res){
    var userId = req.param('userId');
    User.update(userId, req.body, function(err, users){
      
      if (err)
        return res.serverError(err);
      
      if (!users.length) 
        return res.notFound();

      return res.json(users[0]);
    })
  },

  destroy: function(req, res){
    userId = req.param('userId');
    User.findOne(userId, function(err, user){
      if (err) return res.serverError(err);
      if (!user) return res.notFound();

      user.destroy(function(err){
        if (err) return res.serverError(err);
        res.json(user);
      })
    })
  },

  verify: function(req, res) {
    var userId = req.param('userId');
    var verCode = req.param('verificationCode')
    User.verify({
      userId: userId,
      verificationCode: verCode
    }, function(err, user){

      if (err && err.code === "E_MISSING_PARAM")
        return res.badRequest();

      if (err && err.code === "E_BAD_CREDENTIALS")
        return res.forbidden();

      if (err)
        return res.serverError(err);

      res.json(user);

    })
  }
	
};


