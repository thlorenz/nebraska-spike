'use strict';

function format (obj) {
  return Object.keys(obj).reduce(function (acc, k) {
    return acc + '\n\t' + k + ':\t' + obj[k];
  }, '');
}

// TODO: use tableize (substack I think) later
var go = module.exports = function (obj) {
  var s = '';
  if (obj.readable) s += 'Readable:' + format(obj.readable) + '\n';
  if (obj.writable) s += 'Writable:' + format(obj.writable) + '\n';

  return s;
};
