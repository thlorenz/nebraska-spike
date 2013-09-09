'use strict';

var blessed = require('blessed');
var xtend = require('xtend');
var screen = blessed.screen();

var defaultOpts = {
    top    :  'top'
  , left   :  'left'
  , align  :  'left'
  , shrink :  'flex'
  , border :  {
    }
  , bg : 'blue' 
  , fg : 'lightgreen' 
  , label: '?'
};

function defaultFormat (obj) {
  if (Buffer.isBuffer(obj)) return obj.toString();
  if (Array.isArray(obj) || typeof obj === 'object') return JSON.stringify(obj);
  return obj.toString();
}

var go = module.exports = function (obj, opts, format) {

  format = format || defaultFormat;
  opts = xtend(defaultOpts, opts, { content: format(obj) });
  var box = blessed.box(opts);

  screen.append(box);
  screen.render();
};

// Test
if (!module.parent) {
  go('hello');  
}
