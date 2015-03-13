var _ = require('underscore') ;

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
    var params = _.pick(req.body, ['firstName', 'lastName', 'email', 'password']);
    User.create(params, function(err, user){
    
      if (err && err.code === 'E_VALIDATION')
        return res.validationError(err);

      if (err)
        return res.serverError(err);

      res.json(user);
    })
  }
	
};

