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
const randomBytes = require('randombytes');

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
function shuffleList (list, shuffle) {
  if (list.length <= 1) return list;
  if (shuffle === undefined) shuffle = randomList(list.length);

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

module.exports = {
  request: request,
  randomList: randomList,
  shuffleList: shuffleList,
  unshuffleList: unshuffleList
};
