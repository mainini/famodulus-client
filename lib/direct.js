'use strict';

var util = require('./util.js');

function direct (base, exponent, modulus, options, callback) {
  util.request({brief: options.brief || true, modexps: [{b: base, e: exponent, m: modulus}]}, options.server, function (result) {
    callback({r: result[0].r});
  });
}

function directs (modexps, defaults, options, callback) {
  util.request({brief: options.brief || true, b: defaults.base, e: defaults.exponent, m: defaults.modulus, modexps: modexps}, options.server, callback);
}

module.exports = {direct: direct, directs: directs};
