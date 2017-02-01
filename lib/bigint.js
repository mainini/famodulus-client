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

// bit size of mantissa of JS numbers
const maxIntBits = 52;

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

  for (let i = 0; i < maxIntBits; i++) {
    retval[i] = zeros;
    zeros += '0';
  }

  return retval;
})();

function hex2Bin (hexstr) {
  let binstr = '';
  let maxBinBits = maxIntBits / 4;
  let r = hexstr.length % maxBinBits;
  r = r > 0 ? r - maxBinBits : r;

  for (let i = r; i < hexstr.length; i += maxBinBits) {
    let binpart = Number.parseInt(hexstr.substring(i, i + maxBinBits), 16).toString(2);
    if (i > r) {
      binstr += zeros[maxIntBits - binpart.length];
    }
    binstr += binpart;
  }

  return binstr;
}

function bin2Hex (binstr) {
  let hexstr = '';
  let r = binstr.length % maxIntBits;
  r = r > 0 ? r - maxIntBits : r;

  for (let i = r; i < binstr.length; i = i + maxIntBits) {
    let g = Number.parseInt(binstr.substring(i, i + maxIntBits), 2).toString(16);
    if (i > r) {
      hexstr += zeros[(maxIntBits / 4) - g.length];
    }
    hexstr += g;
  }

  return hexstr;
}

function hex2BigInt (hexstr) {
  if (hexstr === '0' || hexstr === '00') {
    return [0];
  } else {
    return bin2BigInt(hex2Bin(hexstr));
  }
}

function bin2BigInt (binstr) {
  let x = [];

  for (let i = binstr.length; i > 0; i -= maxMulBits) {
    x.push(Number.parseInt(binstr.substring(i - maxMulBits, i), 2));
  }

  x.push(0);
  return x;
}

function bigInt2Hex (bigint) {
  if (bigint.length === 1 && bigint[0] === 0) {
    return '0';
  } else {
    return bin2Hex(bigInt2Bin(bigint));
  }
}

function bigInt2Bin (bigint) {
  let s = '';

  for (let i = bigint.length - 2; i >= 0; i--) {
    let b = bigint[i].toString(2);
    if (i < bigint.length - 2) {
      s += zeros[maxMulBits - b.length];
    }
    s += b;
  }

  return s;
}

/**
 * Generate a random BigInt smaller than bound.
 * This uses either window.crypto (Web Crypto API) or crypto.randomBytes (nodejs).
 *
 * @param {BigInt} bound        Upper bound for the random number
 * @returns {BigInt}            A random BigInt smaller than bound.
 */
function random (bound) {
  let bytesize = Math.floor(leemon.bitSize(bound) / 8);
  bytesize = bytesize === 0 ? 1 : bytesize;

  let randhex = new Array(bytesize);
  let rand = ZERO;

  while (leemon.equals(rand, ZERO)) {
    randhex = randomBytes(bytesize).map(byte => byte.toString(16));
    rand = leemon.mod(hex2BigInt(randhex.join('')), bound);
  }

  return rand;
}

module.exports = leemon;
module.exports.ZERO = ZERO;
module.exports.ONE = ONE;
module.exports.hex2BigInt = hex2BigInt;
module.exports.bigInt2Hex = bigInt2Hex;
module.exports.random = random;
