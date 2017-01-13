/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */

/**
 * This module contains a set of supporting functions used by the algorithms of
 * famodulus-client.
 * @module famodulus-client/util
 */

/* global fetch */
'use strict';

require('isomorphic-fetch');
const _I = require('BigInt');
const randomBytes = require('randombytes');

/**
 * A BigInt representing the value 0.
 * @type BigInt
 */
const ZERO = _I.str2bigInt('0', 16, 0);

/**
 * A BigInt representing the value 1.
 * @type BigInt
 */
const ONE = _I.str2bigInt('1', 16, 0);

/**
 * Wrapper for fetch() which POSTs a famodulus-query to the given API and
 * returns a Promise which resolves to the calculated modexps.
 *
 * @param {Object} query        A famodulus-query containing modexps and other values
 * @param {String} api          URI of the API to POST the query to
 * @returns {Promise}           A promise to the remote modexp calculation.
 */
function request (query, api) {
  return fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  }).then(response => response.json()).then(json => json.modexps);
}

/**
 * Generate a random BigInt smaller than bound.
 * This uses either window.crypto (Web Crypto API) or crypto.randomBytes (nodejs).
 *
 * @param {BigInt} bound        Upper bound for the random number
 * @returns {BigInt}            A random BigInt smaller than bound.
 */
function random (bound) {
  let bitsize = _I.bitSize(bound);
  let bytesize = Math.floor(bitsize / 8) === 0 ? 1 : Math.floor(bitsize / 8);
  let randhex = new Array(bytesize);
  let rand = ZERO;

  while (_I.greater(rand, bound) || _I.equals(rand, bound) || _I.equals(rand, ZERO)) {
    let randbytes = randomBytes(bytesize);

    for (let i = 0; i < bytesize; i++) {
      let bhex = randbytes[i].toString(16);
      randhex[i] = randbytes[i] < 0x10 ? '0' + bhex : bhex;
    }

    rand = _I.str2bigInt(randhex.join(''), 16, 0);
  }
  return rand;
}

/**
 * Generate a list with numbers up to count-1 in randomized order.
 * Algorithm: Fisher–Yates shuffle
 *
 * @param {Number} count        Number of elements the list should contain
 * @returns {Number[]}          An array with numbers 0 to count-1 in random order.
 */
function randomList (count) {
  let list = [...Array(count).keys()];    // list containing 0 to count -1

  while (count) {
    let rand = Math.floor((randomBytes(1)[0] / 256) * count--);
    let temp = list[count];
    list[count] = list[rand];
    list[rand] = temp;
  }

  return list;
}

/**
 * Shuffles a given list based the values in a shuffle list. The shuffle list
 * must contain numbers from 0 to list.length-1, the returned list will contain
 * the original elements at the new positions determined by the shuffle list.
 *
 * @param {Array} list          The list to shuffle
 * @param {Number[]} [shuffle]  A list containing the new positions for the elements in list
 * @returns {Array}             The shuffled list.
 */
function shuffleList (list, shuffle = randomList(list.length)) {
  let result = new Array(list.length);
  for (let i = 0; i < list.length; i++) {
    result[i] = list[shuffle[i]];
  }

  return result;
}

/**
 * Reverses a shuffled list back to normal order based on the shuffle list given.
 * @see shuffleList
 * @param {Array} list          The list to reverse
 * @param {Number[]} shuffle    The shuffle list containing the order of the shuffle performed originally
 * @returns {Array}             The unshuffled list.
 */
function unshuffleList (list, shuffle) {
  let result = new Array(list.length);
  for (let i = 0; i < list.length; i++) {
    result[shuffle[i]] = list[i];
  }

  return result;
}

module.exports = {ZERO: ZERO, ONE: ONE, request: request, random: random, randomList: randomList, shuffleList: shuffleList, unshuffleList: unshuffleList};
