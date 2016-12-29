/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */

/**
 * This module implements the direct "algorithm" which simply passes a single
 * or multiple modexps directly to the server without any blinding or checking.
 * Functions in this module should not be called directly, instead calls should
 * be made via FamodulusClient-object.
 * @see famodulus-client/client
 * @module famodulus-client/direct
 */

'use strict';

var util = require('./util.js');

/**
 * Directly calculate a single modexp on the server.
 *
 * Required options are 'server' with a full URI to a famodulus modexp-API and 'brief',
 * indicating if a brief response is desired.
 * @param {String} base - Base of the modexp (hexadecimal)
 * @param {String} exponent - Exponent of the modexp (hexadecimal)
 * @param {String} modulus - Modulus of the modexp (hexadecimal)
 * @param {Object} options - Options, requires 'server' and 'brief'
 * @returns {Promise} A promise to the remote modexp calculation.
 */
function direct (base, exponent, modulus, options) {
  return util.request({brief: options.brief, modexps: [{b: base, e: exponent, m: modulus}]}, options.server).then(result => result[0]);
}

/**
 * Directly calculate one or multiple modexp(s) on the server.
 *
 * Required options are 'server' with a full URI to a famodulus modexp-API and 'brief',
 * indicating if a brief response is desired.
 * @param {Object[]} modexps - An Array with modexps in the form {b:'base', e:'exponent', m:'modulus'}
 *                             (values are hexadecimal and may be undefined)
 * @param {Object} defaults - An Object with properties 'base', 'exponent' and 'modulus' to be used as default
 *                            if omitted in any modexp (values are hexadecimal and may be undefined)
 * @param {Object} options - Options, requires 'server' and 'brief'
 * @returns {Promise} A promise to the remote modexp calculation.
 */
function directs (modexps, defaults, options) {
  return util.request({brief: options.brief, b: defaults.base, e: defaults.exponent, m: defaults.modulus, modexps: modexps}, options.server);
}

module.exports = {direct: direct, directs: directs};
