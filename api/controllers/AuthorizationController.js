module.exports = {

  login: function(req, res) {
    var params = {
      email: req.body.email,
      password: req.body.password
    }

    User.verifyCredentials(params, function(err, user){
      if (user) {
        req.session.user = user.id;
        res.cookie('user', user.id);
        return res.json({user: user});
      }

      return res.status(403).send("Unauthorized");
    })
  },

  logout: function(req, res) {
    try {
      req.session.destroy();
      res.clearCookie('user')
      res.json({loggedOut: true})
    } catch (err) {
      console.error(err);
      res.status(500).json({loggedOut: false});
    }
  }
}