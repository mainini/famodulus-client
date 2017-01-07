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

/* global Promise */
'use strict';

var _I = require('BigInt');
var util = require('./util.js');
var direct = require('./direct.js');

/**
 * Calculate a single or multiple modexp(s) with blinded exponent on two servers. If options.checked
 * is true, for each modexp, an identical modexp will be sent additionally to both servers and an error
 * will be raised if they are not identical. The order of the modexps and of the calls to the servers is randomized.
 *
 * Required options are 'servers' containing two full URIs to a famodulus modexp-API and 'brief',
 * indicating if a brief response is desired.
 *
 * @param {Object[]} modexps    An Array with modexps in the form {b:'base', e:'exponent', m:'modulus'}
 *                              (values are hexadecimal and may be undefined)
 * @param {Object} defaults     Default params given as {b:'base', e:'exponent', m:'modulus'}, applied if
 *                              omitted in any modexp (values are hexadecimal and may be undefined)
 * @param {Object} options      Options, requires 'servers' and 'brief'
 * @returns {Promise}           A promise to the remote modexp calculation.
 */
function decExponent (modexps, defaults, options) {
  // fill in default values for each modexp, where missing
  var data;
  if (defaults.b || defaults.e || defaults.m) {
    data = modexps.map(modexp =>
      ({
        b: modexp.b || defaults.b,
        e: modexp.e || defaults.e,
        m: modexp.m || defaults.m
      }));
  } else data = modexps;

  // ======= 1.) split exponents and prepare a list with modexps for each server =======

  var moduli = [];            // moduli of modexps may be different, we need to remember them for final multiplication
  var modexpsB = [];          // modexps with exponent b
  var modexpsC = [];          // modexps with exponent c
  data.forEach(modexp => {
    var a = _I.str2bigInt(modexp.e, 16, 0);             // a <- exponent
    var p = _I.str2bigInt(modexp.m, 16, 0);             // p <- modulus
    var q = _I.sub(p, util.ONE);                        // q <- p-1 (p is prime by definition!)
    var b = util.random(q);                             // b <- random in Z_q
    var c = _I.mod(_I.sub(_I.add(a, q), b), q);         // c <- (a+q)-b mod q, we add q first to ensure c > 0
    //                                                                (BigInt returns 2s-complement otherwise)

    // sanity check, a has to be in Z_q
    if (_I.greater(a, q) || _I.equals(a, q)) Promise.reject(new RangeError('Exponent not in Z_q!'));

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

  return Promise.resolve(Promise.all([
    direct.direct(util.shuffleList(modexpsB, listShuffle), {}, {server: servers[0]}),
    direct.direct(util.shuffleList(modexpsC, listShuffle), {}, {server: servers[1]})
  ]).then(data => {
    if (data[0].length !== data[1].length) throw new Error('Inequal amount of results obtained!');

    // ======= 3.) having obtained all results, multiply them ( u^b*u^c mod p ) and return =======

    var res1 = util.unshuffleList(data[0], listShuffle);
    var res2 = util.unshuffleList(data[1], listShuffle);

    // check if the test-values for checkability correspond
    if (options.checked) {
      var dataLength = res1.length / 2;
      for (var i = 0; i < dataLength; i++) {
        var check1 = res1.splice(i + 1, 1)[0];
        var check2 = res2.splice(i + 1, 1)[0];
        if (check1.r !== check2.r) throw new Error('Checking failed!');
      }
    }

    // multiply results and return them
    var results = [];
    for (var j = 0; j < res1.length; j++) {
      if (options.brief) results[j] = {};
      else results[j] = {b: modexps[j].b, e: modexps[j].e, m: modexps[j].m};
      results[j].r = _I.bigInt2str(_I.multMod(_I.str2bigInt(res1[j].r, 16, 0), _I.str2bigInt(res2[j].r, 16, 0), moduli[j]), 16);
    }

    return results;
  }));
}

module.exports = {decExponent: decExponent};
