module.exports = function(stack){
  var length = stack.length;

  return function(req, res, next){
    var jobs = length
      , ready;

    ready = function(err){
      if(err){
        jobs = -1;
        return next(err);
      }

      jobs--;
      if(jobs == 0)
        return next();
    }

    for(var i in stack){
      stack[i].call(this, req, res, ready);
    }
  }
}
