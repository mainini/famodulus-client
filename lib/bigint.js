/*
 * Copyright 2017 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */

/**
 * This module wraps Leemon BigInt and provides additional, more performant
 * conversion functions.
 *
 * Kudos to Rolf Haenni for the initial implementation of the algorithms.
 *
 * @module famodulus-client/bigint
 */

'use strict';

const leemon = require('BigInt');
const randomBytes = require('randombytes');

/**
 * A BigInt representing the value 0.
 * @type BigInt
 */
const ZERO = [0];

/**
 * A BigInt representing the value 1.
 * @type BigInt
 */
const ONE = [1, 0];

var maxIntBits = 52; // bit size of mantissa of JS numbers

// max bit size to perform integer multiplications
const maxMulBits = (() => {
  let bpi = 0;
  while ((1 << (bpi + 1)) > (1 << bpi)) {
    bpi++;
  }
  return bpi >> 1;
})();

const zeros = (() => {
  let retval = new Array(maxIntBits);
  let zeros = '';

  for (var i = 0; i < maxIntBits; i++) {
    retval[i] = zeros;
    zeros += '0';
  }

  return retval;
})();

function hex2BigInt (h) {
  return bin2BigInt(hex2Bin(h));
}

function hex2Bin (h) {
  var b = '';
  var r = h.length % (maxIntBits / 4);
  if (r > 0) r = r - (maxIntBits / 4);
  for (var i = r; i < h.length; i = i + maxIntBits / 4) {
    var g = parseInt(h.substring(i, i + (maxIntBits / 4)), 16).toString(2);
    if (i > r) {
      b += zeros[maxIntBits - g.length];
    }
    b += g;
  }
  return b;
}

function bin2BigInt (b) {
  var x = [];
  for (var i = b.length; i > 0; i = i - maxMulBits) {
    x.push(parseInt(b.substring(i - maxMulBits, i), 2));
  }
  x.push(0);
  return x;
}

function bigInt2Hex (x) {
  return bin2Hex(bigInt2Bin(x));
}

function bigInt2Bin (x) {
  var s = '';
  for (var i = x.length - 2; i >= 0; i--) {
    var b = x[i].toString(2);
    if (i < x.length - 2) {
      s += zeros[maxMulBits - b.length];
    }
    s += b;
  }
  return s;
}

function bin2Hex (b) {
  var h = '';
  var r = b.length % maxIntBits;
  if (r > 0) r = r - maxIntBits;
  for (var i = r; i < b.length; i = i + maxIntBits) {
    var g = parseInt(b.substring(i, i + maxIntBits), 2).toString(16);
    if (i > r) {
      h += zeros[(maxIntBits / 4) - g.length];
    }
    h += g;
  }
  return h;
}

/**
 * Generate a random BigInt smaller than bound.
 * This uses either window.crypto (Web Crypto API) or crypto.randomBytes (nodejs).
 *
 * @param {BigInt} bound        Upper bound for the random number
 * @returns {BigInt}            A random BigInt smaller than bound.
 */
function random (bound) {
  let bitsize = leemon.bitSize(bound);
  let bytesize = Math.floor(bitsize / 8) === 0 ? 1 : Math.floor(bitsize / 8);
  let randhex = new Array(bytesize);
  let rand = ZERO;

  while (leemon.equals(rand, ZERO)) {
    let randbytes = randomBytes(bytesize);

    for (let i = 0; i < bytesize; i++) {
      let bhex = randbytes[i].toString(16);
      randhex[i] = randbytes[i] < 0x10 ? '0' + bhex : bhex;
    }
    rand = leemon.mod(hex2BigInt(randhex.join(''), 16, 0), bound);
  }
  return rand;
}

module.exports = leemon;
module.exports.ZERO = ZERO;
module.exports.ONE = ONE;
module.exports.hex2BigInt = hex2BigInt;
module.exports.bigInt2Hex = bigInt2Hex;
module.exports.random = random;
