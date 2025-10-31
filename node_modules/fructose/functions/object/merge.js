module.exports = function(){
  var args = Array.prototype.slice.apply(arguments)
    , first = args.shift();
    
  for(var key in args){
    for(var _key in args[key]){
      first[_key] = args[key][_key];
    }
  }
  return first;
}
