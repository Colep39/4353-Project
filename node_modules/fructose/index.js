var fs = require('fs')
  , path = require('path')
  , join = path.join
  , ls = fs.readdirSync
  , stat = fs.statSync
  
  , functions = join(__dirname, 'functions')
  
  , fn = {}
  
fn.notTempOrHidden = function(name){
if(name instanceof Function) console.log(name.toString())
  return (name[0] != '.' && name.lastIndexOf('~') != name.length - 1)
}
  
ls(functions).forEach(function(dir){
  var _functions = join(functions, dir)
  if (stat(_functions).isDirectory() && fn.notTempOrHidden(dir)){
    ls(_functions).forEach(function(func){
      if (fn.notTempOrHidden(func)){
        var _fn = require(join(_functions, func))
        if(_fn instanceof Function)
          fn[func.replace('.js', '')] = _fn
      }
    })
  }
})

module.exports = fn
