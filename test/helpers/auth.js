var should = require('should')

module.exports = {
  login: function(agent, creds, callback) {
    agent
    .post('/login')
    .send(creds)
    .end(callback)
  },

  loginAdmin: function(agent, callback) {
    this.login(agent, {
      email: 'admin@test.com',
      password: "admin_password"
    }, function(err, res){
      if (err) throw err;
      res.status.should.eql(200);
      callback(err, res);
    })
  },

  loginPlayer: function(agent, callback) {
    this.login(agent, {
      email: 'player@test.com',
      password: "player_password"
    }, function(err, res){
      if (err) throw err;
      res.status.should.eql(200);
      callback(err, res);
    })
  },

  logout: function(agent, callback) {
    agent.get("/logout").end(callback);
  }
}