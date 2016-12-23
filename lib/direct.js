'use strict';

var util = require('./util.js');

module.exports.direct = function (base, exponent, modulus, options, callback) {
  util.request({brief: options.brief || true, modexps: [{b: base, e: exponent, m: modulus}]}, options.server, callback);
};

module.exports.directs = function (modexps, defaults, options, callback) {
  util.request({brief: options.brief, b: defaults.base, e: defaults.exponent, m: defaults.modulus, modexps: modexps}, options.server, callback);
};
