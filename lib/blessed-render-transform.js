'use strict';

var util         =  require('util')
  , stream       =  require('stream')
  , Transform     =  stream.Transform
  , setImmediate =  setImmediate || function (fn) { setTimeout(fn, 0) }
  , renderBlessed = require('./render-blessed')
  ;

module.exports = BlessedRenderTransform;

util.inherits(BlessedRenderTransform, Transform);

function BlessedRenderTransform (opts) {
  if (!(this instanceof BlessedRenderTransform)) return new BlessedRenderTransform(opts);

  Transform.call(this, opts);

  opts = opts || {};
  this._format = opts.format;
  this._blessed = opts.blessed;
  this.objectMode = true;
}

BlessedRenderTransform.prototype._transform = function (conf, encoding, cb) {
  var self = this;
  function done () {
    self.push(conf);
    cb();
  }

  if (!conf) return done();
  var blessed, format, value;

  // conf could be a value or a blessed config with value attached
  if (typeof conf.blessedValue === 'undefined') {
    blessed =  this._blessed;
    format  =  this._format;
    value   =  conf;
  } else {
    // full blown config object
    format  =  conf.format || this._format;
    blessed =  conf.blessed || this._blessed;
    value   =  conf.blessedValue;
  }

  if (conf.index) {
    blessed.left = '50%';
  }

  renderBlessed(value, blessed, format);
  done();
}
