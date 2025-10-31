var ls = require('fs').readdirSync
  , join = require('path').join
  , stat = require('fs').statSync;

/**
 * Synchronous recursive tree
 *
 * @param {string} Directory
 *
 * @returns {array}
 */

var lsDeep = module.exports = function(dir){
  var result = []
    , list = ls(dir);

  for(var i in list){
    var name = list[i]
      , path = join(dir, name);

    if(stat(path).isDirectory()) {
      result = result.concat(lsDeep(path));
    } else {
      result.push(path);
    }
  }

  return result;
}
