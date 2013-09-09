'use strict';

var util      =  require('util')
  , stream    =  require('stream')
  , Transform =  stream.Transform
  ;

module.exports = BlessTransform;

var Transform =  stream.Transform

util.inherits(BlessTransform, Transform);

function BlessTransform (opts) {
  Transform.call(this, opts);
  this._blessed = opts.blessed;
}

BlessTransform.prototype._transform = function (val, enc, cb) {
  this._blessed.blessedValue = val;
  this.push(this._blessed);
  cb();
}
