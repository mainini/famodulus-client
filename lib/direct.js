'use strict';

var util = require('./util.js');

function direct (base, exponent, modulus, options) {
  return util.request({brief: options.brief, modexps: [{b: base, e: exponent, m: modulus}]}, options.server).then(result => ({r: result[0].r}));
}

function directs (modexps, defaults, options) {
  return util.request({brief: options.brief, b: defaults.base, e: defaults.exponent, m: defaults.modulus, modexps: modexps}, options.server);
}

module.exports = {direct: direct, directs: directs};
