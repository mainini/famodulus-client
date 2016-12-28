/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */
/* global fetch */
'use strict';

/**
 * This module contains a set of supporting functions used by the algorithms of
 * famodulus-client.
 * @module
 */

require('es6-promise').polyfill();
require('isomorphic-fetch');

var _I = require('BigInt');

/**
 * A BigInt representing the value 0
 * @type BigInt
 */
var ZERO = _I.str2bigInt('0', 16, 0);

/**
 * A BigInt representing the value 1
 * @type BigInt
 */
var ONE = _I.str2bigInt('1', 16, 0);

/**
 * Wrapper for fetch() which POSTs a famodulus-query to the given API and
 * returns a Promise which resolves to the calculated modexps.
 * @param {Object} query - a famodulus-query containing modexps and other values
 * @param {String} api - URI of the API to POST the query to
 * @returns {Promise} A promise to the calculated modexps
 */
function request (query, api) {
  return new Promise(function (resolve, reject) {
    fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    }).then(response => response.json()).then(json => {
      resolve(json.modexps);
    }).catch(ex => {
      reject(ex);
    });
  });
}

/**
 * Generate a random BigInt smaller than bound.
 * @param {BigInt} bound - Upper bound for the random number
 * @returns {BigInt} a random BigInt smaller than bound
 */
function random (bound) {
  // @todo CSPRNG?
  var bits = _I.bitSize(bound) < 8 ? 8 : _I.bitSize(bound);
  var rand = _I.randBigInt(bits, 1);
  while (_I.greater(rand, bound) || _I.equals(rand, bound) || _I.equals(rand, ZERO)) {
    rand = _I.randBigInt(bits);
  }
  return rand;
}

/**
 * Generate a list with numbers up to count-1 in randomized order.
 * @param {Number} count - number of elements the list should contain
 * @returns {Number[]} An array with numbers 0 to count-1 in random order
 */
function randomList (count) {
  // @todo CSPRNG?
  // Fisher–Yates shuffle
  var list = [count];
  for (var i = 0; i < count; i++) {
    list[i] = i;
  }

  var temp, r;
  var l = list.length;
  while (l) {
    r = Math.floor(Math.random() * l--);
    temp = list[l];
    list[l] = list[r];
    list[r] = temp;
  }

  return list;
}

/**
 * Shuffles a given list based the values in a shuffle list. The shuffle list
 * must contain numbers from 0 to list.length-1, the returned list will contain
 * the original elements at the new positions determined by the shuffle list.
 * @param {Array} list - the list to shuffle
 * @param {Number[]} shuffle - a list containing the new positions for the elements in list
 * @returns {Array} the shuffled list
 */
function shuffleList (list, shuffle) {
  if (arguments.length === 1) shuffle = randomList(list.length);

  var result = [list.length];
  for (var i = 0; i < list.length; i++) {
    result[i] = list[shuffle[i]];
  }

  return result;
}

/**
 * Reverses a shuffled list back to normal order based on the shuffle list given.
 * @see shuffleList
 * @param {Array} list the list to reverse
 * @param {Number[]} shuffle the shuffle list containing the order of the shuffle performed originally
 * @returns {Array} the unshuffled list
 */
function unshuffleList (list, shuffle) {
  var result = [list.length];
  for (var i = 0; i < list.length; i++) {
    result[shuffle[i]] = list[i];
  }

  return result;
}

module.exports = {ZERO: ZERO, ONE: ONE, request: request, random: random, randomList: randomList, shuffleList: shuffleList, unshuffleList: unshuffleList};
