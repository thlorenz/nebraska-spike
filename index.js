'use strict';

var util                   =  require('util')
  , stream                 =  require('stream')
  , Readable               =  stream.Readable
  , Writable               =  stream.Writable
  , BlessedRenderTransform =  require('./lib/blessed-render-transform')
  , formatReport           =  require('./lib/format-report')
  ;

util.inherits(WatcherReadable, Readable);
function WatcherReadable (opts) { 
  if (!(this instanceof WatcherReadable)) return new WatcherReadable(opts);

  opts = opts || {};
  opts.objectMode = true;
  Readable.call(this, opts);
  this._interval = opts.interval || 500;

  this._streams = [];
  this._reported = {};
  this._pushes = 0;
}

var proto = WatcherReadable.prototype;

proto._read = function () {
  setTimeout(this._report.bind(this), this._interval);
}

proto.add = function (stream) {
  var info = {};
  if (stream._readableState) info.readable = stream._readableState;
  if (stream._writableState) info.writable = stream._writableState;
  info.name = stream.constructor.name;
  this._streams.push(info);

  return this;
}

proto._report = function () {
  var self = this;
  this._streams.forEach(report);
  function report (stream) {
    var r = { name: stream.name };
    if (stream.readable) r.readable = self._reportReadable(stream.readable);
    if (stream.writable) r.writable = self._reportWritable(stream.writable);
    self._reported = r;
  }

  this.push(this._reported);
  this._pushes++;
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

// Test
if (!module.parent) {
  var NumberReadable    =  require('./test/util/number-readable')
    , ThrottleTransform =  require('./test/util/throttle-transform')
    , PowerTransform    =  require('./test/util/power-transform')
    , DevNullWritable   =  require('./lib/dev-null-writable')
    , tap = require('tap-stream')
    ;

  var numbers  =  new NumberReadable();
  var powers   =  new PowerTransform();

  // unblocks the eventloop for one turn to allow rendering to happen 
  var minThrottle  =  new ThrottleTransform();
  var longThrottle =  new ThrottleTransform({ throttle: 10000 });
  var devnull      =  new DevNullWritable();

  var numberRender = new BlessedRenderTransform({
    blessed: { 
        label: 'Numbers'
      , top: '95%'
      , left: '70%'
      , padding: { left: 1, right: 1 }
    } 
  });

  var powerRender = new BlessedRenderTransform({
    blessed: { 
        label: 'Powers'
      , top: '95%'
      , left: '85%'
      , padding: { left: 1, right: 1 }
    } 
  });

  var watcherRender = new BlessedRenderTransform({
      objectMode: true
    , blessed: { 
          label: 'Watcher'
        , top: 'top'
        , left: '5%'
        , padding: { left: 1, right: 1 }
      } 
    , format: formatReport
  });

  var watcher = new WatcherReadable({ interval: 500 });
  watcher
    .add(longThrottle)
//    .pipe(tap())
   .pipe(watcherRender)
  
  numbers
    .pipe(minThrottle)
    .pipe(numberRender)
    .pipe(longThrottle)
    .pipe(powers)
    .pipe(powerRender)
    ;
}
