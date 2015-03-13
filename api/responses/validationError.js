module.exports = function validationError (err, options) {

  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  res.status(412);

  res.json(err);
}