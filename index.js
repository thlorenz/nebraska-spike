'use strict';

var util = require('util')
  , stream = require('stream')
  , Readable = stream.Readable
  , Writable = stream.Writable
  , renderBlessed = require('./lib/render-blessed')
  , formatReport = require('./lib/format-report')
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
  if (stream._writableState) info.writable = stream._writableState;
  info.name = stream.constructor.name;
  this.streams.push(info);

  return this;
}

proto._report = function () {
  var self = this;
  this.streams.forEach(report);
  function report (stream) {
    var r = { name: stream.name };
    if (stream.readable) r.readable = self._reportReadable(stream.readable);
    if (stream.writable) r.writable = self._reportWritable(stream.writable);

    renderBlessed(r, null, formatReport);
  }
}

proto._reportReadable = function (readable) {
  var report = {};

  [ 'highWaterMark'
  //, 'objectMode'
  //, 'flowing'
  //, 'pipesCount'
  //, 'reading' 
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
  ].forEach(reportOn);

  function reportOn (k) {
    report[k] = writable[k];
  }

  report.bufferLength = writable.buffer.length;
  return report;
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
  var NumberReadable    =  require('./test/util/number-readable')
    , ThrottleTransform =  require('./test/util/throttle-transform')
    , PowerTransform    =  require('./test/util/power-transform')
    , DevNullWritable   =  require('./lib/dev-null-writable')
    ;

  var numbers  =  new NumberReadable();
  var powers   =  new PowerTransform();
  var throttle =  new ThrottleTransform({ throttle: 5 });
  var devnull  =  new DevNullWritable();

  var watcher = new StreamWatcher({ interval: 500 });
  watcher
    .add(throttle)
    .start()
  
  numbers
    .pipe(throttle)
    .pipe(powers)
    //.pipe(process.stdout)
    .pipe(devnull)
    ;
}
