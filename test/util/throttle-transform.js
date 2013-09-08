'use strict';

var util      =  require('util')
  , stream    =  require('stream')
  , Transform =  stream.Transform
  ;

module.exports = ThrottleTransform;

util.inherits(ThrottleTransform, Transform);

function ThrottleTransform (opts) {
  if (!(this instanceof ThrottleTransform)) return new ThrottleTransform(opts);

  opts = opts || {};
  Transform.call(this, opts);
  this._throttle = opts.throttle || 200;
}

ThrottleTransform.prototype._transform = function (chunk, encoding, cb) {
  var self = this;
  setTimeout(passThru, this._throttle);
  function passThru() {
    self.push(chunk);
    cb();
  }
}
