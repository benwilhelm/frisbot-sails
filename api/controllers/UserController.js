var _ = require('underscore') ;

module.exports = {

  list: function(req, res){
    var query = {};
    if (req.param('status') == 'active') {
      query.suspended = false
    }

    if (req.param('status') == 'suspended') {
      query.suspended = true
    }

    User.find(query).sort('lastName').exec(function(err, users){
      if (err) res.serverError(err);
      res.json(users);
    })
  }
	
};

