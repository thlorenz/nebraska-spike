'use strict';

var util = require('util')
  , stream = require('stream')
  , Readable = stream.Readable

module.exports = NumberReadable;

util.inherits(NumberReadable, Readable);

function NumberReadable (opts) {
  Readable.call(this, opts);
  this.idx = 0;
  this._throttle = opts.throttle;
}

NumberReadable.prototype._read = function () {
  var self = this;
  function respond () {
    self.push('' + self.idx++);
  }
  if (this._throttle) setTimeout(respond, this._throttle);
  else respond();
}
