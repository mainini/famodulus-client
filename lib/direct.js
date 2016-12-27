'use strict';

var util = require('./util.js');

function direct (base, exponent, modulus, options) {
  return new Promise(function (resolve, reject) {
    util.request({brief: options.brief, modexps: [{b: base, e: exponent, m: modulus}]}, options.server).then(result => {
      resolve({r: result[0].r});
    }).catch(ex => {
      reject(ex);
    });
  });
}
function directs (modexps, defaults, options) {
  return new Promise(function (resolve, reject) {
    util.request({brief: options.brief, b: defaults.base, e: defaults.exponent, m: defaults.modulus, modexps: modexps}, options.server).then(result => {
      resolve(result);
    }).catch(ex => {
      reject(ex);
    });
  });
}

module.exports = {direct: direct, directs: directs};
