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
const _I = require('BigInt');
const util = require('./util.js');
const direct = require('./direct.js');

var bpi = 52; // bit size of mantissa of JS numbers
var bpe = 0; // max bit size to perform integer multiplications
for (bpe = 0; (1 << (bpe + 1)) > (1 << bpe); bpe++)
  ;
bpe >>= 1;

var z = [""]; // precomputation of strings with leading zeros
for (var i = 1; i < bpi; i++) {
  z.push(z[z.length - 1] + "0");
}

function bigInt2Hex (x) {
  return bin2Hex(bigInt2Bin(x));
}

function hex2BigInt (h) {
  return bin2BigInt(hex2Bin(h));
}

function bigInt2Bin (x) {
  var s = "";
  for (var i = x.length - 2; i >= 0; i--) {
    var b = x[i].toString(2);
    if (i < x.length - 2) {
      s += z[bpe - b.length];
    }
    s += b;
  }
  return s;
}

function bin2Hex (b) {
  var h = "";
  var r = b.length % bpi;
  if (r > 0) r = r - bpi;
  for (var i = r; i < b.length; i = i + bpi) {
    var g = parseInt(b.substring(i, i + bpi), 2).toString(16).toUpperCase();
    if (i > r) {
      h += z[(bpi / 4) - g.length];
    }
    h += g;
  }
  return h;
}

function bin2BigInt (b) {
  var x = [];
  for (var i = b.length; i > 0; i = i - bpe) {
    x.push(parseInt(b.substring(i - bpe, i), 2));
  }
  x.push(0);
  return x;
}

function hex2Bin (h) {
  var b = "";
  var r = h.length % (bpi / 4);
  if (r > 0) r = r - (bpi / 4);
  for (var i = r; i < h.length; i = i + bpi / 4) {
    var g = parseInt(h.substring(i, i + (bpi / 4)), 16).toString(2);
    if (i > r) {
      b += z[bpi - g.length];
    }
    b += g;
  }
  return b;
}

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
  let data;
  if (defaults.b || defaults.e || defaults.m) {
    data = modexps.map(modexp =>
      ({
        b: modexp.b || defaults.b,
        e: modexp.e || defaults.e,
        m: modexp.m || defaults.m
      }));
  } else data = modexps;

  // ======= 1.) split exponents and prepare a list with modexps for each server =======

  let moduli = [];            // moduli of modexps may be different, we need to remember them for final multiplication
  let modexpsB = [];          // modexps with exponent b
  let modexpsC = [];          // modexps with exponent c
  for (let modexp of data) {
    let a = hex2BigInt(modexp.e); // a <- exponent
    let p = hex2BigInt(modexp.m);             // p <- modulus
    let q = _I.sub(p, util.ONE);                        // q <- p-1 (p is prime by definition!)
    let b = util.random(q);                             // b <- random in Z_q
    let c = _I.mod(_I.sub(_I.add(a, q), b), q);         // c <- (a+q)-b mod q, we add q first to ensure c > 0
    //                                                                (BigInt returns 2s-complement otherwise)

    // sanity check, a has to be in Z_q
    if (_I.greater(a, q) || _I.equals(a, q)) return Promise.reject(new RangeError('Exponent not in Z_q!'));

    // add modexp to lists
    moduli.push(p);
    modexpsB.push({b: modexp.b, e: _I.bigInt2str(b, 16), m: modexp.m});
    modexpsC.push({b: modexp.b, e: _I.bigInt2str(c, 16), m: modexp.m});

    // if checked calculations are desired, add a modexp with randomized
    // exponent but same base and modulus for each server
    if (options.checked) {
      moduli.push(p);
      let rStr = _I.bigInt2str(util.random(q), 16);
      modexpsB.push({b: modexp.b, e: rStr, m: modexp.m});
      modexpsC.push({b: modexp.b, e: rStr, m: modexp.m});
    }
  }

  // ======= 2.) Randomize order of modexps and send them in random order to servers =======

  let listShuffle = util.randomList(moduli.length);
  let servers = util.shuffleList(options.servers);

  return Promise.resolve(Promise.all([
    direct.direct(util.shuffleList(modexpsB, listShuffle), {}, {server: servers[0]}),
    direct.direct(util.shuffleList(modexpsC, listShuffle), {}, {server: servers[1]})
  ]).then(data => {
    if (data[0].length !== data[1].length) throw new Error('Inequal amount of results obtained!');

    // ======= 3.) having obtained all results, multiply them ( u^b*u^c mod p ) and return =======

    let res1 = util.unshuffleList(data[0], listShuffle);
    let res2 = util.unshuffleList(data[1], listShuffle);

    // check if the test-values for checkability correspond
    if (options.checked) {
      let dataLength = res1.length / 2;
      for (let i = 0; i < dataLength; i++) {
        if (res1.splice(i + 1, 1)[0].r !== res2.splice(i + 1, 1)[0].r) throw new Error('Checking failed!');
      }
    }

    // multiply results and return them
    let results = new Array(res1.length);
    for (let i = 0; i < res1.length; i++) {
      if (options.brief) results[i] = {};
      else results[i] = {b: modexps[i].b, e: modexps[i].e, m: modexps[i].m};
      results[i].r = _I.bigInt2str(_I.multMod(bigInt2Hex(res1[i].r), bigInt2Hex(res2[i].r), moduli[i]), 16);
//      results[i].r = _I.bigInt2str(_I.multMod(_I.str2bigInt(res1[i].r, 16, 0), _I.str2bigInt(res2[i].r, 16, 0), moduli[i]), 16);
    }

    return results;
  }));
}

module.exports = {decExponent: decExponent};
