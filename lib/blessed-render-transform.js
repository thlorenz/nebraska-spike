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

  opts.objectMode = true;

  opts = opts || {};
  this._format = opts.format;
  this._blessed = opts.blessed;

  Transform.call(this, opts);
}

BlessedRenderTransform.prototype._transform = function (conf, encoding, cb) {
  var self = this;
  function done () {
    if (conf) self.push(conf);
    cb();
  }

  if (!conf) return cb();
  var blessed, format, value;

  // conf could be a value or a blessed config with value attached
  if (!conf.hasOwnProperty('blessedValue')) {
    blessed =  this._blessed;
    format  =  this._format;
    value   =  conf;
  } else {
    // full blown config object
    format        =  conf.format || this._format;
    blessed       =  conf.blessed || this._blessed;
    blessed.label =  blessed.label || conf.label;
    value         =  conf.blessedValue;
  }

  renderBlessed(value, blessed, format);
  done();
}
