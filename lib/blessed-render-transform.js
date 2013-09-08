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

  // conf could be a value or a blessed config with value attached
  if (typeof conf.blessedValue === 'undefined') {
    renderBlessed(conf, this._blessed, this._format);
    return done();
  }

  // full blown config object
  var format      =  conf.format || this._format;
  var blessedOpts =  conf.blessed || this._blessed;
  var value       =  conf.blessedValue;

  renderBlessed(value, blessedOpts, format);
  done();
}
