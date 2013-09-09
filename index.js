'use strict';

var util                   =  require('util')
  , stream                 =  require('stream')
  , Readable               =  stream.Readable
  , Writable               =  stream.Writable
  , xtend                  =  require('xtend')
  , BlessedRenderTransform =  require('./lib/blessed-render-transform')
  , formatReport           =  require('./lib/format-report')
  ;

var defaultOpts = {
    blessed: { 
        top: 'top'
      , left: '5%'
      , padding: { left: 1, right: 1 }
    } 
  , format: formatReport
};

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


function renderStreamState(stream, opts) {
  opts = opts || {};
  opts.blessed = xtend(defaultOpts.blessed, opts.blessed);
  opts = xtend(defaultOpts, opts);
  opts.objectMode = true;

  opts.blessed.label = opts.blessed.label || (stream.constructor.name + '(W)');

  return new WatcherReadable(stream, opts)
    .pipe(new BlessTransform(opts))
    .pipe(new BlessedRenderTransform(opts))
}

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
  setTimeout(this._report.bind(this), this._interval);
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

function offsetRender(stream, x, y) {
  renderStreamState (
      stream
    , { blessed: { 
          left: x + '%'
        , top: y + '%' 
      } 
    }
  );
}

// Test
if (!module.parent) {
  var NumberReadable    =  require('./test/util/number-readable')
    , ThrottleTransform =  require('./test/util/throttle-transform')
    , PowerTransform    =  require('./test/util/power-transform')
    , DevNullWritable   =  require('./lib/dev-null-writable')
    , tap               =  require('tap-stream')
    ;

  var numbers  =  new NumberReadable();
  var powers   =  new PowerTransform();

  // unblocks the eventloop for one turn to allow rendering to happen 
  var minThrottle  =  new ThrottleTransform();
  var longThrottle =  new ThrottleTransform({ throttle: 100 });
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

  
  numbers
    .pipe(minThrottle)
    .pipe(numberRender)
    .pipe(longThrottle)
    .pipe(powers)
    .pipe(powerRender)
    ;

  offsetRender(numbers, 0, 0)
  offsetRender(longThrottle, 40, 0)
  offsetRender(powers, 0, 15)
}
