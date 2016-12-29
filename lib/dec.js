/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */

/**
 * This module implements the basic decomposition (DEC) algorithm for blinding
 * of the modexp-params.
 * Functions in this module should not be called directly, instead calls should
 * be made via FamodulusClient-object.
 * @see famodulus-client/client
 * @module famodulus-client/dec
 */

'use strict';

var _I = require('BigInt');
var util = require('./util.js');
var direct = require('./direct.js');

/**
 * Calculate a single modexp with blinded exponent on two servers. If options.checked
 * is true, an identical modexp will be sent additionally to both servers and an error
 * will be raised if they are not identical.
 * The order of the modexps and of the calls to the servers is randomized.
 *
 * Required options are 'servers' containing two full URIs to a famodulus modexp-API and 'brief',
 * indicating if a brief response is desired.
 * @param {String} base - Base of the modexp (hexadecimal)
 * @param {String} exponent - Exponent of the modexp (hexadecimal)
 * @param {String} modulus - Modulus of the modexp (hexadecimal)
 * @param {Object} options - Options, requires 'server' and 'brief'
 * @returns {Promise} A promise to the remote modexp calculation.
 */
function decExponent (base, exponent, modulus, options) {
  return decExponents([{b: base, e: exponent, m: modulus}], {}, options).then(result => result[0]);
}

/**
 * Calculate a single or multiple modexp(s) with blinded exponent on two servers. If options.checked
 * is true, for each modexp, an identical modexp will be sent additionally to both servers and an error
 * will be raised if they are not identical.
 * The order of the modexps and of the calls to the servers is randomized.
 *
 * Required options are 'servers' containing two full URIs to a famodulus modexp-API and 'brief',
 * indicating if a brief response is desired.
 * @param {Object[]} modexps - An Array with modexps in the form {b:'base', e:'exponent', m:'modulus'}
 *                             (values are hexadecimal and may be undefined)
 * @param {Object} defaults - An Object with properties 'base', 'exponent' and 'modulus' to be used as default
 *                            if omitted in any modexp (values are hexadecimal and may be undefined)
 * @param {Object} options - Options, requires 'server' and 'brief'
 * @returns {Promise} A promise to the remote modexp calculation.
 */
function decExponents (modexps, defaults, options) {
  return new Promise(function (resolve, reject) {
    // fill in default values for each modexp, where missing
    var modexpsWithDefaults = modexps.map(modexp => ({b: modexp.b || defaults.base, e: modexp.e || defaults.exponent, m: modexp.m || defaults.modulus}));

    // ======= 1.) split exponents and prepare a list with modexps for each server =======

    var moduli = [];            // moduli of modexps may be different, we need to remember them for final multiplication
    var modexpsB = [];          // modexps with exponent b
    var modexpsC = [];          // modexps with exponent c
    modexpsWithDefaults.forEach(modexp => {
      var a = _I.str2bigInt(modexp.e, 16, 0);             // a <- exponent
      var p = _I.str2bigInt(modexp.m, 16, 0);             // p <- modulus
      var q = _I.sub(p, util.ONE);                        // q <- p-1 (p is prime by definition!)
      var b = util.random(q);                             // b <- random in Z_q
      var c = _I.mod(_I.sub(_I.add(a, q), b), q);         // c <- (a+q)-b mod q, we add q first to ensure c > 0
      //                                                                (BigInt returns 2s-complement otherwise)

      // sanity check, a has to be in Z_q
      if (_I.greater(a, q) || _I.equals(a, q)) reject(new RangeError('Exponent not in Z_q!'));

      // add modexp to lists
      moduli.push(p);
      modexpsB.push({b: modexp.b, e: _I.bigInt2str(b, 16), m: modexp.m});
      modexpsC.push({b: modexp.b, e: _I.bigInt2str(c, 16), m: modexp.m});

      // if checked calculations are desired, add a modexp with randomized
      // exponent but same base and modulus for each server
      if (options.checked) {
        moduli.push(p);
        var rStr = _I.bigInt2str(util.random(q), 16);
        modexpsB.push({b: modexp.b, e: rStr, m: modexp.m});
        modexpsC.push({b: modexp.b, e: rStr, m: modexp.m});
      }
    });

    // ======= 2.) Randomize order of modexps and send them in random order to servers =======

    var listShuffle = util.randomList(moduli.length);
    var servers = util.shuffleList(options.servers);
    var resultsB, resultsC;

    // Server 1
    direct.directs(util.shuffleList(modexpsB, listShuffle), {}, {server: servers[0]}).then(result => {
      if (resultsC) _calculateResult(util.unshuffleList(result, listShuffle), util.unshuffleList(resultsC, listShuffle));
      else resultsB = result;
    });

    // Server 2
    direct.directs(util.shuffleList(modexpsC, listShuffle), {}, {server: servers[1]}).then(result => {
      if (resultsB) _calculateResult(util.unshuffleList(resultsB, listShuffle), util.unshuffleList(result, listShuffle));
      else resultsC = result;
    });

    // ======= 3.) having obtained all results, multiply them ( u^b*u^c mod p ) and return =======

    function _calculateResult (resB, resC) {
      // check if the test-values for checkability correspond
      if (options.checked) {
        var dataLength = resB.length / 2;
        for (i = 0; i < dataLength; i++) {
          var checkB = resB.splice(i + 1, 1)[0];
          var checkC = resC.splice(i + 1, 1)[0];
          if (checkB.r !== checkC.r) reject(new Error('Checking failed!'));
        }
      }

      // multiply results and return them
      var results = [resB.length];
      for (var i = 0; i < resB.length; i++) {
        if (options.brief) results[i] = {};
        else results[i] = {b: modexps[i].b, e: modexps[i].e, m: modexps[i].m};
        results[i].r = _I.bigInt2str(_I.multMod(_I.str2bigInt(resB[i].r, 16, 0), _I.str2bigInt(resC[i].r, 16, 0), moduli[i]), 16);
      }
      resolve(results);
    }
  });
}

module.exports = {decExponent: decExponent, decExponents: decExponents};
