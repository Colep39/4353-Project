String.prototype.esplit = function(){
  if(this.length == 0)
    return [];
  
  var args = Array.prototype.slice.apply(arguments)
    , options = {
      delimiter: ','
    }
  
  if(args.length > 2 && args[args.length - 1] instanceof Object) {
    var _options = args.pop();
    for(var i in _options){
      options[i] = _options[i];
    }
  }
  
  args = args.reverse();
  for(var i in args) {
    if(i < args.length -1) {
      args[i] = {
        symbol: args[i].substr(0, 1),
        arg: args[i].substr(1)
      }
    }
  }

  var str = this.split(options.delimiter)
    , result = [];
  str.forEach(function(str, i){
    var r = {};
    for(var j in args) {
      var a = args[j]
        , firstIndex = (j != args.length - 1) ? (str.indexOf(a.symbol) + 1) : 0
        , secondIndex = (j == 0) ? str.length : str.indexOf(args[j - 1].symbol);

      r[a instanceof Object ? a.arg : a] = str.substring(firstIndex, secondIndex);
    }
    result.push(r);
  });

  return result;
}
