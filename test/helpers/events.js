var should = require('should')
  , _ = require('underscore')
  ; 

module.exports = {

  testEmitted: function(obj, evt, done, callback){
    var errTimeout = setTimeout(function(){
      throw new Error("Event '" + evt + "' never fired") 
      done();
    }, 1000)

    obj.on(evt, function(obj){
      var args = _.toArray(arguments);
      args.unshift(null)
      clearTimeout(errTimeout);
      if (callback) {
        return callback.apply(obj, args);
      }

      done();
    })
  }
}