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

var direct = require('./direct.js');
var dec = require('./dec.js');

/**
 * The FamodulusClient class provides all functionality offered by famodulus-client
 * to the developer. It is configured with an Array of famodulus-server modexp API
 * URIs and can then subsequently be used to calculate outsourced (remote) modexps
 * using different algorithms.
 * @param {String[]} servers - An Array of modexp API URIs, the number required is dependent of the
 *                             algorithms used
 * @param {boolean} [brief] - If true, the parameters of the modexps calculated (base, exponent and modulus)
 *                          are returned together with the result, defaults to false
 * @class
 */
function FamodulusClient (servers, brief) {
  if (!(this instanceof FamodulusClient)) return new FamodulusClient(servers, brief);

  this.servers = servers;
  this.brief = arguments.length === 2 ? brief : true;
}

/**
 * Directly send the given modexp to a server for calculation without any further processing.
 * @param {String} base - Base of the modexp (hexadecimal)
 * @param {String} exponent - Exponent of the modexp (hexadecimal)
 * @param {String} modulus - Modulus of the modexp (hexadecimal)
 * @param {Number} [server] - Index of the server to take from the servers-Array. If
 *                            not specified, the first will be taken.
 * @returns {Promise} A promise to the remote modexp calculation.
 */
FamodulusClient.prototype.direct = function (base, exponent, modulus, server) {
  if (arguments.length === 3) return direct.direct(base, exponent, modulus, {server: this.servers[0], brief: this.brief});
  else return direct.direct(base, exponent, modulus, {server: this.servers[server], brief: this.brief});
};

/**
 * Directly send the given modexp(s) to a server for calculation without any further processing.
 * A modexp takes the form {b:'base', e:'exponent', m:'modulus'} with base, exponent and modulus
 * being hexadecimal strings.
 * Optional default values can be specified in the same form, and are applied if they are missing
 * in any of the modexps.
 * Optionally, a server can be specified using it's index in the servers-Array.
 * @param {Object[]} modexps - An Array of modexp-objects
 * @param {Object} [defaults] - An optional modexp-object to be used as default values
 * @param {Number} [server] - Index of the server to take from the servers-Array. If
 *                            not specified, the first will be taken.
 * @returns {Promise} A promise to the remote modexp calculation.
 */
FamodulusClient.prototype.directs = function (modexps, defaults, server) {
  if (arguments.length === 1) {
    server = 0;
    defaults = {b: undefined, e: undefined, m: undefined};
  } else if (arguments.length === 2) {
    server = 0;
  }
  return direct.directs(modexps.map(modexp => ({b: modexp[0], e: modexp[1], m: modexp[2]})),
      defaults, {brief: this.brief, server: this.servers[server]});
};

/**
 * Calculate the given modexp using basic decomposition (DEC) on two servers,
 * blinding the exponent. If checked is true, a checking version of the algorithm
 * is run which detects erroneus or malicious behavior on one server only with a probability
 * of 1/2.
 * @param {String} base - Base of the modexp (hexadecimal)
 * @param {String} exponent - Exponent of the modexp (hexadecimal)
 * @param {String} modulus - Modulus of the modexp (hexadecimal)
 * @param {boolean} checked - If true, run the checking algorithm
 * @returns {Promise} A promise to the remote modexp calculation.
 */
FamodulusClient.prototype.decExponent = function (base, exponent, modulus, checked) {
  return dec.decExponent(base, exponent, modulus,
      {brief: this.brief, servers: this.servers, checked: checked});
};

/**
 * Calculate the given modexp(s) using basic decomposition (DEC) on two servers,
 * blinding the exponent. If checked is true, a checking version of the algorithm
 * is run which detects erroneus or malicious behavior on one server only with a probability
 * of 1/2.
 * A modexp takes the form {b:'base', e:'exponent', m:'modulus'} with base, exponent and modulus
 * being hexadecimal strings.
 * Optional default values can be specified in the same form, and are applied if they are missing
 * in any of the modexps.
 * @param {Object[]} modexps - An Array of modexp-objects
 * @param {Object} [defaults] - An optional modexp-object to be used as default values
 * @param {boolean} checked - If true, run the checking algorithm
 * @returns {Promise} A promise to the remote modexp calculation.
 */
FamodulusClient.prototype.decExponents = function (modexps, defaults, checked) {
  if (arguments.length === 2) {
    checked = defaults;
    defaults = {b: undefined, e: undefined, m: undefined};
  }
  return dec.decExponents(modexps.map(modexp => ({b: modexp[0], e: modexp[1], m: modexp[2]})),
      defaults, {brief: this.brief, servers: this.servers, checked: checked});
};

module.exports = FamodulusClient;
