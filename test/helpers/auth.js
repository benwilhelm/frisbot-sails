var should = require('should')

module.exports = {
  login: function(agent, creds, callback) {
    agent
    .post('/login')
    .send(creds)
    .end(callback)
  },

  logout: function(agent, callback) {
    agent.get("/logout").end(callback);
  }
}