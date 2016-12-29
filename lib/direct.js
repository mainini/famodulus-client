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
 * Directly calculate one or multiple modexp(s) on the server.
 *
 * Required options are 'server' with a full URI to a famodulus modexp-API and 'brief',
 * indicating if a brief response is desired.
 *
 * @param {Object[]} modexps    An Array with modexps in the form {b:'base', e:'exponent', m:'modulus'}
 *                              (values are hexadecimal and may be undefined)
 * @param {Object} defaults     Default params given as {b:'base', e:'exponent', m:'modulus'}, applied if
 *                              omitted in any modexp (values are hexadecimal and may be undefined)
 * @param {Object} options      Options, requires 'server' and 'brief'
 * @returns {Promise}           A promise to the remote modexp calculation.
 */
function direct (modexps, defaults, options) {
  return util.request({brief: options.brief, b: defaults.b, e: defaults.e, m: defaults.m, modexps: modexps}, options.server);
}

module.exports = {direct: direct};
