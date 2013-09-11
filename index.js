'use strict';

var util                   =  require('util')
  , stream                 =  require('stream')
  , Readable               =  stream.Readable
  , Writable               =  stream.Writable
  , xtend                  =  require('xtend')
  , BlessTransform         =  require('./lib/bless-transform')
  , BlessedRenderTransform =  require('./lib/blessed-render-transform')
  , WatcherReadable        =  require('./lib/watcher-readable')
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
    , PowerTransform    =  require('./test/util/power-transform')
    , ThrottleTransform =  require('./lib/throttle-transform')
    , DevNullWritable   =  require('./lib/dev-null-writable')
    , tap               =  require('tap-stream')
    , hwm = 50 
    ;

  var numbers  =  new NumberReadable({ highWaterMark: hwm, throttle: 250 });
  var powers   =  new PowerTransform({ highWaterMark: hwm, throttle: 1000 });

  // unblocks the eventloop for one turn to allow rendering to happen 
  var minThrottle  =  new ThrottleTransform();
  var devnull      =  new DevNullWritable();

  var numberRender = new BlessedRenderTransform({
    blessed: { 
        label: 'Numbers'
      , top: '95%'
      , left: '70%'
      , padding: { left: 1, right: 1 }
    } 
    , objectMode: true
  });

  var powerRender = new BlessedRenderTransform({
    blessed: { 
        label: 'Powers'
      , top: '95%'
      , left: '85%'
      , padding: { left: 1, right: 1 }
    } 
    , objectMode: true
  });

  
  numbers
    .pipe(minThrottle)
    .pipe(numberRender)
    .pipe(powers)
    .pipe(powerRender)
    ;

  offsetRender(numbers, 0, 0)
  offsetRender(powers, 45, 0)
}
