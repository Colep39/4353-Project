/**
 * Deep Merge
 * deepMerge(Object, Object, Object..., [Array of keys to exclude])
 */

var deepMerge = module.exports = function() {
  var args = Array.prototype.slice.apply(arguments)
    , argsCount = args.length - 1
    , result = {}
    , exclude;

  if(Array.isArray(args[argsCount]))
    exclude = args.pop();

  if(!args[argsCount]){
    args.pop();
    argsCount--;
  }

  for(var key in args){
    for(var _key in args[key]){
      if(!exclude || exclude.indexOf(_key) == -1) {
        var val = args[key][_key];
        if(result[_key]) {
          if(val.constructor == Object){
            result[_key] = deepMerge(result[_key], val, exclude);
          } else {
            if(Array.isArray(result[_key]) && Array.isArray(val)){
              result[_key] = result[_key].concat(val);
            } else {
              result[_key] = val;
            }
          }
        } else {
          result[_key] = val;
        }
      }
    }
  }

  return result;
}
