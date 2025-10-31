var fs = require('fs')
  , crypto = require('crypto');

module.exports = function (pathname, callback) {
  var sha = crypto.createHash('sha1')
    , stream = fs.ReadStream(pathname);

  var ev = stream.on('data', function (data) {
    sha.update(data);
  }).on('end', function() {
    callback(null, sha.digest('hex'));
  });
  
  if(callback)
    ev.on('error', callback);
}
