/*
 * Copyright 2017 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */

/**
 * This module wraps Leemon BigInt and provides additional, more performant
 * conversion functions as well as support for CSPRNG random.
 *
 * Kudos to Rolf Haenni for the initial implementation of the algorithms.
 *
 * @module famodulus-client/bigint
 */

'use strict';

let leemon = require('BigInt');
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

/**
 * Bit size of mantissa of JS numbers.
 * @type Number
 */
const maxIntBits = 52;

/**
 * Maximum bit size to perform integer multiplications.
 * @type Number
 */
const maxMulBits = (() => {
  let bpi = 0;
  while ((1 << (bpi + 1)) > (1 << bpi)) {
    bpi++;
  }
  return bpi >> 1;
})();

/**
 * Precomputed array containing strings with '0' up to maxIntBits.
 * @type String[]
 */
const zeros = (() => {
  let retval = new Array(maxIntBits);
  let zeros = '';

  for (let i = 0; i < maxIntBits; i++) {
    retval[i] = zeros;
    zeros += '0';
  }

  return retval;
})();

/**
 * Convert a string with a number in hexadecimal format to a binary string.
 *
 * @param {String} hexstr       String with number in hexadecimal
 * @returns {String}            String with number in binary
 */
function hex2Bin (hexstr) {
  let binstr = '';
  const maxBinBits = maxIntBits / 4;

  let r = hexstr.length % maxBinBits;
  r = r > 0 ? r - maxBinBits : r;

  for (let i = r; i < hexstr.length; i += maxBinBits) {
    let bin = Number.parseInt(hexstr.substring(i, i + maxBinBits), 16).toString(2);
    if (i > r) {
      binstr += zeros[maxIntBits - bin.length];
    }
    binstr += bin;
  }

  return binstr;
}

/**
 * Convert a string with a number in binary format to a hexadecimal string.
 *
 * @param {String} binstr       String with number in binary
 * @returns {String}            String with number in hexadecimal
 */
function bin2Hex (binstr) {
  let hexstr = '';

  let r = binstr.length % maxIntBits;
  r = r > 0 ? r - maxIntBits : r;

  for (let i = r; i < binstr.length; i += maxIntBits) {
    let hex = Number.parseInt(binstr.substring(i, i + maxIntBits), 2).toString(16);
    if (i > r) {
      hexstr += zeros[(maxIntBits / 4) - hex.length];
    }
    hexstr += hex;
  }

  return hexstr;
}

/**
 * Converts a string with a hexadecimal number to BigInt.
 *
 * @param {String} hexstr       The hexadecimal number to convert.
 * @returns {BigInt}            BigInt representation of the number
 */
function hex2BigInt (hexstr) {
  if (hexstr === '0' || hexstr === '00') {
    return [0];
  } else {
    return bin2BigInt(hex2Bin(hexstr));
  }
}

/**
 * Converts a string with a binary number to BigInt.
 *
 * @param {String} binstr       The binary number to convert.
 * @returns {BigInt}            BigInt representation of the number
 */
function bin2BigInt (binstr) {
  let bigint = [];

  for (let i = binstr.length; i > 0; i -= maxMulBits) {
    bigint.push(Number.parseInt(binstr.substring(i - maxMulBits, i), 2));
  }

  bigint.push(0);
  return bigint;
}

/**
 * Converts a BigInt to a hexadecimal string
 *
 * @param {BigInt} bigint       The BigInt to convert
 * @returns {String}            Hexadecimal representation of the number
 */
function bigInt2Hex (bigint) {
  if (bigint.length === 1 && bigint[0] === 0) {
    return '0';
  } else {
    return bin2Hex(bigInt2Bin(bigint));
  }
}

/**
 * Converts a BigInt to a binary string
 *
 * @param {BigInt} bigint       The BigInt to convert
 * @returns {String}            Binary representation of the number
 */
function bigInt2Bin (bigint) {
  let retval = '';

  for (let i = bigint.length - 2; i >= 0; i--) {
    let bin = bigint[i].toString(2);
    if (i < bigint.length - 2) {
      retval += zeros[maxMulBits - bin.length];
    }
    retval += bin;
  }

  return retval;
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

leemon.ZERO = ZERO;
leemon.ONE = ONE;
leemon.hex2BigInt = hex2BigInt;
leemon.bin2BigInt = bin2BigInt;
leemon.bigInt2Hex = bigInt2Hex;
leemon.bigInt2Bin = bigInt2Bin;
leemon.random = random;
module.exports = leemon;
