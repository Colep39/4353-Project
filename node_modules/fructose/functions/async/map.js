module.exports = function(stack, processor, callback, scope){
  var isArray = Array.isArray(stack)
    , counter = isArray ? stack.length : Object.keys(stack).length
    , Result = callback.length == 2 ? (isArray ? [] : {}) : false
    , error
    , cb;

  cb = function(err, result){
    if(err){
      counter = -1;
      return callback(err);
    }

    counter--;
    if(counter == 0){
      return callback(error, Result);
    }

    if(counter > 0 && Result && result){
      if(isArray){
        Result.push(result);
      } else {
        fructose.merge(Result, result);
      }
    }
  }

  for(var i in stack){
    if(isArray){
      processor.call(scope, stack[i], cb);
    } else {
      processor.apply(scope, [ stack[i], i, cb ]);
    }
  }
}
