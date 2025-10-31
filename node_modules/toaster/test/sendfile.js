var path = require('path')
  , exists = path.existsSync
  , Toaster
  , toaster
  , req = { params: {} }
  , res = {};

Toaster = require('../index.js');
req.params.filename = '100x100-d2afdaab98deb35f98865348a37edb9395aa22ca.jpg';
res.sendfile = function(path){
  if(!exists(path))
    throw new Error('Requested file does not exists!');
}

toaster = new Toaster({
  target: './test/uploads', // TODO Change me
  type: 'image',
  crop: [ '100x100', '150x200' ],
  resize: '200x200',
  fields: [ 'foo', 'bar', 'baz' ]
});

toaster.on('ready', function(){
  toaster.sendfileMiddleware()(req, res, function(err){
    if(err)
      throw new Error(err);
  });

});
