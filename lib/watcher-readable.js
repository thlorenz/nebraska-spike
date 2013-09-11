'use strict';
var util                   =  require('util')
  , stream                 =  require('stream')
  , Readable               =  stream.Readable

module.exports = WatcherReadable;

util.inherits(WatcherReadable, Readable);
function WatcherReadable (stream, opts) { 
  if (!(this instanceof WatcherReadable)) return new WatcherReadable(opts);

  opts = opts || {};
  opts.objectMode = true;
  Readable.call(this, opts);
  this._interval = opts.interval || 500;

  var info = {};
  if (stream._readableState) info.readable = stream._readableState;
  if (stream._writableState) info.writable = stream._writableState;
  this._label = (opts.blessed && opts.blessed.label) || stream.constructor.name + '(W)';
  this._streamInfo = info;
}

var proto = WatcherReadable.prototype;

proto._read = function () {
  var self = this;
  function report () {
    self._report();
  }

  setTimeout(report, this._interval);
}

proto._report = function () {
  var info = this._streamInfo;
  var r = { label: this._label };

  if (info.readable) r.readable = this._reportReadable(info.readable);
  if (info.writable) r.writable = this._reportWritable(info.writable);
  r.index = info.index;

  this.push(r);
}

proto._reportReadable = function (readable) {
  var report = {};

  [ 'highWaterMark'
  //, 'objectMode'
  //, 'flowing'
  //, 'pipesCount'
  , 'reading' 
  //, 'ranOut'
  //, 'awaitDrain'
  ].forEach(reportOn);

  function reportOn (k) {
    report[k] = readable[k];
  }

  report.bufferLength = readable.buffer.length;
  return report;
}

proto._reportWritable = function (writable) {
  var report = {};

  [ 'highWaterMark'
  , 'writing'
  ].forEach(reportOn);

  function reportOn (k) {
    report[k] = writable[k];
  }

  report.bufferLength = writable.buffer.length;
  return report;
}
