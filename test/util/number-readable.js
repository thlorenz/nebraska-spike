'use strict';

var util = require('util')
  , stream = require('stream')
  , Readable = stream.Readable

module.exports = NumberReadable;

util.inherits(NumberReadable, Readable);

function NumberReadable (opts) {
  Readable.call(this, opts);
  this.idx = 0;
}

NumberReadable.prototype._read = function () {
  this.push(' ' + this.idx++);
}
