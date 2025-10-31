var Toaster, fs, fr, toaster, skel, req = { files: {} };

Toaster = require('../index.js');
fs = require('fs');
fr = require('fructose');

skel = {
  size: 47315,
  path: './test/tmp/', // TODO Change me !WARNING file will be moved
  name: false
}

toaster = new Toaster({
  target: './test/uploads/', // TODO Change me
  type: 'image',
  crop: [ '100x100', '150x200' ],
  resize: '200x200',
  fields: [ 'foo', 'bar', 'baz' ],
  keepTmp: true
});

toaster.on('ready', function(){
  var files = fs.readdirSync(skel.path).filter(function(file){ return file[0] !== '.' });

  toaster.options.fields.forEach(function(field){
    var file = files.pop();
    if(file)
      req.files[field] = fr.merge({}, skel, { path: skel.path + file, name: file });
  });

  toaster.uploadMiddleware()(req, null, function(err){
    if(err)
      throw new Error(err);

    console.log(req.files);
  });

});
