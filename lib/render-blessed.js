'use strict';

var blessed = require('blessed');
var xtend = require('xtend');
var screen = blessed.screen();

var defaultOpts = {
    top     :  'top'
  , left    :  'left'
  , height  :  '200'
  , width   :  '400'
  , border: {
      type: 'line'
    }
};

function defaultFormat (obj) {
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
