module.exports = function validationError (data, options) {
  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  // Set status code
  res.status(412);

  res.send();
}