'use strict';

var blessed = require('blessed');
var screen = blessed.screen();

var go = module.exports = function (report) {

  var box = blessed.box({
    top     :  'center',
    left    :  'center',
    width   :  '50%',
    height  :  '50%',
    content :  report,
  });

  screen.append(box);
  screen.render();
};

// Test
if (!module.parent) {
  go('hello');  
}
