var fs = require('fs')
  , util = require('util');

module.exports = function(i, o, callback){
  var is = fs.createReadStream(i)
    , os = fs.createWriteStream(o);

  util.pump(is, os, function(err) {
    var result = { from: i, to: o };

    if (err) return callback(err, result);

    fs.unlink(i);
    callback(null, result);
  });
}
