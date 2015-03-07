var should = require('should')

module.exports = {
  login: function(agent, creds, callback) {
    if (arguments.length === 2) {
      creds = { email: 'admin@test.com', password: 'admin_password' };
      callback = creds;
    }

    agent
    .post('/login')
    .send(creds)
    .end(callback)
  }
}