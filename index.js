'use strict';

var util = require('util')
  , stream = require('stream')
  , Readable = stream.Readable
  , Writable = stream.Writable
  , DevNullWritable = require('./lib/dev-null-writable')
  ;

function StreamWatcher (opts) { 
  opts = opts || {};
  this._interval = opts.interval || 500;

  this.streams = [];
}

var proto = StreamWatcher.prototype;

proto.add = function (stream) {
  var info = {};
  if (stream._readableState) info.readable = stream._readableState;
  if (stream._writeableState) info.writeable = stream._writeableState;
  info.name = stream.toString();
  this.streams.push(info);

  return this;
}

proto._report = function () {
  var self = this;
  this.streams.forEach(report);
  function report (stream) {
    if (stream.readable) self._reportReadable(stream.name, stream.readable);
  }
}

proto._reportReadable = function (name, readable) {
  var report = {};
  [ 'objectMode', 'highWaterMark', 'flowing', 'pipesCount', 'reading' ].forEach(reportOn);

  function reportOn (k) {
    report[k] = readable[k];
  }
  console.log(report);
}

proto.start = function () {
  this.startIv = setInterval(this._report.bind(this), this._interval);
  return this;
}

proto.stop = function () {
  clearInterval(this.startIv);
  return this;
}

// Test
if (!module.parent) {
  var NumberReadable = require('./test/util/number-readable');


  var numbers = new NumberReadable();
  numbers.pipe(new DevNullWritable({ throttle: 0 }));


  var watcher = new StreamWatcher();
  watcher
    .add(numbers)
    .start()
  
}
