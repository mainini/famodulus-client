/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */

/**
 * This is the main module exported by famodulus-client. It exports a constructor
 * for a FamodulusClient-object which can be parametrized and used for remote
 * modexp calculations using different algorithms.
 * @module famodulus-client/client
 */

'use strict';

var dir = require('./direct.js');
var dec = require('./dec.js');

/**
 * The FamodulusClient class provides all functionality offered by famodulus-client
 * to the developer. It is configured with an Array of famodulus-server modexp API
 * URIs and can then subsequently be used to calculate outsourced (remote) modexps
 * using different algorithms.
 *
 * @param {String[]} servers    An Array of modexp API URIs, the number of servers required
 *                              is dependent on the algorithms used
 * @param {boolean} [checked]   If true, algorithms with checking are applied. Algorithms not supporting
 *                              checking return an error. Default: false
 * @param {boolean} [brief]     If false, the parameters of the modexps calculated (base, exponent and modulus)
 *                              are returned together with the result. Default: true.
 * @class
 */
function FamodulusClient (servers, checked, brief) {
  if (arguments.length === 1) {
    checked = false;
    brief = true;
  } else if (arguments.length === 2) {
    brief = true;
  }

  if (!(this instanceof FamodulusClient)) return new FamodulusClient(servers, checked, brief);

  this.servers = servers;
  this.checked = checked;
  this.brief = brief;
}

/**
 * Directly send the given modexp(s) to a server for calculation without any further processing.
 *
 * A modexp takes the form {b:'base', e:'exponent', m:'modulus'} with base, exponent and modulus
 * being hexadecimal strings. Optional default values can be specified in the same form, and are
 * applied if they are missing in any of the modexps.
 *
 * @param {Object[]} modexps    An Array of modexp-objects
 * @param {Object} [defaults]   An optional modexp-object to be used as default values
 * @param {Number} [server]     Index of the server to take from the servers-Array. Default: 0
 * @returns {Promise}           A promise to the remote modexp calculation.
 */
FamodulusClient.prototype.direct = function (modexps, defaults, server) {
  if (this.checked) throw new Error('direct algorithm does not support checking!');
  if (arguments.length < 1 || arguments.length > 3) throw new Error('invalid number of arguments!');

  if (arguments.length === 1) {
    server = 0;
    defaults = {};
  } else if (arguments.length === 2) {
    if (typeof defaults === 'number') {
      server = defaults;
      defaults = {};
    } else {
      server = 0;
    }
  }

  return dir.direct(modexps, defaults, {brief: this.brief, server: this.servers[server]});
};

/**
 * Calculate the given modexp(s) using basic decomposition (DEC) on two servers,
 * with blinding of the exponent. If checked is true, a checking version of the algorithm
 * is run which detects erroneus or malicious behavior on one server only with a probability
 * of 1/2.
 *
 * A modexp takes the form {b:'base', e:'exponent', m:'modulus'} with base, exponent and modulus
 * being hexadecimal strings. Optional default values can be specified in the same form, and are
 * applied if they are missing in any of the modexps.
 *
 * @param {Object[]} modexps    An Array of modexp-objects
 * @param {Object} [defaults]   An optional modexp-object to be used as default values
 * @param {boolean} [checked]   Overrides setting in constructor
 * @returns {Promise}           A promise to the remote modexp calculation.
 */
FamodulusClient.prototype.decExponent = function (modexps, defaults, checked) {
  if (arguments.length < 1 || arguments.length > 3) throw new Error('invalid number of arguments!');

  if (arguments.length === 1) {
    defaults = {};
    checked = this.checked;
  } else if (arguments.length === 2) {
    if (typeof defaults === 'boolean') {
      checked = defaults;
      defaults = {};
    } else {
      checked = this.checked;
    }
  }

  if (typeof checked !== 'boolean') throw new Error('checked must be boolean!');

  return dec.decExponent(modexps, defaults, {brief: this.brief, servers: this.servers, checked: checked});
};

module.exports = FamodulusClient;
