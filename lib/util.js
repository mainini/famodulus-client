/* global fetch */
'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

var _I = require('BigInt');
var ZERO = _I.str2bigInt('0', 16, 0);
var ONE = _I.str2bigInt('1', 16, 0);

function request (query, server, callback) {
  fetch(server, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  }).then(function (response) {
    return response.json();
  }).then(function (json) {
    callback(json.modexps);
  }).catch(function (ex) {
    // @todo errorhandling
  });
}

function random (bound) {
  // @todo CSPRNG?
  var bits = _I.bitSize(bound) < 8 ? 8 : _I.bitSize(bound);
  var rand = _I.randBigInt(bits, 1);
  while (_I.greater(rand, bound) || _I.equals(rand, bound) || _I.equals(rand, ZERO)) {
    rand = _I.randBigInt(bits);
  }
  return rand;
}

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

function shuffleList (list, shuffle) {
  if (arguments.length === 1) shuffle = randomList(list.length);

  var result = [list.length];
  for (var i = 0; i < list.length; i++) {
    result[i] = list[shuffle[i]];
  }

  return result;
}

function unshuffleList (list, shuffle) {
  var result = [list.length];
  for (var i = 0; i < list.length; i++) {
    result[shuffle[i]] = list[i];
  }

  return result;
}

module.exports = {ZERO: ZERO, ONE: ONE, request: request, random: random, randomList: randomList, shuffleList: shuffleList, unshuffleList: unshuffleList};
