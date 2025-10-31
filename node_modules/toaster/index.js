var path = require('path')
  , fs = require('fs')
  , dirname = path.dirname
  , join = path.join
  , exists = path.exists
  , events = require('events')

  , fr = require('fructose')
  , errors = require('express-errors')
  , Class = require('Class')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , gm = require('gm')
  
  , Toaster
  , File
  , Image;

function hashToPath(hash){
  return hash.split(/(.{2})/).join('/').replace(/\/\//g, '/'); // FIXME double slash? WTF?!
}

Toaster = Class.create({
  initialize: function(options){
    var self = this;
    if('object' !== typeof options)
      throw new Error('Toaster: options required');

    options.target = options.target.replace(/\/$/, ''); // Remove last /
    mkdirp(options.target, function(err){
      if(err)
        throw new Error(err);

      switch(options.type){
        case 'file':
          self.Handler = File;
          break;
        case 'image':
          if(options.resize)
            options.resize = self.parseSize(options.resize);
          if(options.crop)
            options.crop = self.parseSize(options.crop);

          self.Handler = Image;
          break;
        default :
          throw new Error('Toaster: "type" option required or unsupported type passed');
      }

      if(!options.fields)
        options.fields = [ 'file' ];
      if(!Array.isArray(options.fields))
        options.fields = [ options.fields ];

      self.options = options;
      process.nextTick(function(){
        self.emit('ready');
      });
    });
  },

  parseSize: function(size){
    var result = [], _size;

    if(!Array.isArray(size))
      size = [ size ];

    size.forEach(function(size){
      _size = size.split('x');

      result.push({
        width: _size.shift(),
        height: _size.shift(),
        raw: size
      });
    });


    return result;
  },

  uploadMiddleware: function(){
    var self = this;

    return function(req, res, next){
      self.iterator(req.files, function(err, result){
        if(err)
          return next(err);

        req.files = result;
        next();
      });
    }
  },

  /**
   * app.get('/images/:filename', toaster.sendfileMiddleware());
   */
  sendfileMiddleware: function(){
    var self = this;
    return function(req, res, next){
      var filename = req.params.filename
        , hash
        , path;

      hash = filename.match(/^[0-9x0-9-]*([a-f0-9]{40})\.[a-z]{1,10}$/);
      if(!hash)
        return next(errors.NotFound);

      path = self.options.target + hashToPath(hash[1]) + filename;
      res.sendfile(path);
    }
  },

  iterator: function(files, callback){
    var self = this;

    async.map(this.options.fields, function(field, _callback){
      var file = files[field]
        , handler;

      if(!file)
        return _callback(null, false);

      handler = new (self.Handler)(file, self.options);
      handler.save(_callback);
    }, function(err, files){
      if(err)
        return callback(err);
      var result = {}
        , fields = self.options.fields;

      for (var i in files){
        result[fields[i]] = files[i];
      }

      callback(null, result);
    });
  }
}, events.EventEmitter.prototype);



File = Class.create({
  initialize: function(file, options){
    this.file = file;
    this.options = options;
    this.tasks = [];

    // Pushing tasks
    this.tasks.unshift(this._mkdirp); // reverse order
    this.tasks.unshift(this._determinePath); // reverse order
    this.tasks.unshift(this._hash); // reverse order

    // >Tasks
    //
    // *hash
    // *determinePath
    // *move -> pushing in save mthod
  },

  _hash: function(file, callback){
    var self = this;

    fr.sha1File(file.path, function(err, hash){
      if(err)
        return callback(err);

      self.hash = hash;
      callback();
    });
  },

  _determinePath: function(file, callback){
    var hashPath = hashToPath(this.hash);

    this.filename = this.hash;
    file.name = /(\.[a-z]+)$/i.exec(file.name);
    if(file.name)
      this.filename += file.name[0].toLowerCase();

    this.directory = this.options.target + hashPath;
    this.path = this.directory + this.filename;
    callback();
  },

  _mkdirp: function(file, callback){
    mkdirp(this.directory, callback);
  },

  _move: function(file, callback){
    var self = this;
    fr.move(file.path, self.path, callback);
  },

  save: function(callback){
    var self = this;
    if(!this.options.keepTmp)
      this.tasks.push(this._move); // Last

    async.mapSeries(this.tasks, function(task, _callback){
      task.call(self, self.file, _callback);
    }, function(err){
      if(err)
        return callback(err);

      callback(null, self);
    });
  }
});

Image = Class.create(File, {
  initialize: function($super, file, options){
    $super.call(this, file, options);
    if(options.resize)
      this.tasks.push(this._resize);
    if(options.crop)
      this.tasks.push(this._crop);

    this.gm = gm(file.path);
    // >Tasks
    //
    // *hash
    // *determinePath
    // *resize
    // *move
  },

  writePath: function(size){
    return this.directory + size.raw + '-' + this.filename;
  },

  _resize: function(file, callback){
    var self = this;

    async.map(this.options.resize, function(size, _callback){
        self.gm
          .quality(100)
          .resize(size.width, size.height)
          .write(self.writePath(size), _callback);
    }, callback);
  },

  _crop: function(file, callback){
    var self = this;

    async.map(this.options.crop, function(size, _callback){
      self.gm
        .thumb(size.width, size.height, self.writePath(size), 100, _callback);
    }, callback);
  }
});


module.exports = Toaster;
