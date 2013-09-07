'use strict';

var util = require('util')
  , stream = require('stream')
  , Readable = stream.Readable
  ;

function StreamWatcher (opts) { 
  opts = opts || {};
  var interval = opts.interval || 500;

  this.streams = [];
  setInterval(this.report.bind(this), interval);
}

var proto = StreamWatcher.prototype;

proto.add = function (stream) {
  var info = {};
  if (stream._readableState) info.readable = stream._readableState;
  if (stream._writeableState) info.writeable = stream._writeableState;
  info.name = stream.toString();
  this.streams.push(info);
}

proto.report = function () {
  var self = this;
  this.streams.forEach(report);
  function report (stream) {
    if (stream.readable) self.reportReadable(stream.name, stream.readable);
    if (stream.writeable) self.reportwriteable(stream.name, stream.writeable);
  }
}

proto.reportReadable = function (name, readable) {
  var report = {};
  [ 'objectMode', 'highWaterMark', 'flowing', 'pipesCount', 'reading' ].forEach(reportOn);

  function reportOn (k) {
    report[k] = readable[k];
  }
  console.log(report);
}

util.inherits(NumberSource, Readable);

function NumberSource (opts) {
  Readable.call(this, opts);
  this.idx = 0;
}

NumberSource.prototype._read = function () {
  this.push(' ' + this.idx++);
}

var numbers = new NumberSource();

// numbers.pipe(process.stdout);


var watcher = new StreamWatcher();
watcher.add(numbers);
