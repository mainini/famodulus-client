'use strict';

var _I = require('BigInt');
var ZERO = _I.str2bigInt('0', 16, 0);
var ONE = _I.str2bigInt('1', 16, 0);

module.exports.ZERO = ZERO;
module.exports.ONE = ONE;

var request = function (query, server, callback) {
  var req = new XMLHttpRequest();
  req.addEventListener('load', function () {
    var res = JSON.parse(this.responseText);
    if (res.modexps.length === 1) {
      callback(res.modexps[0]);
    } else {
      callback(res.modexps);
    }
  });

  req.open('POST', server);
  req.setRequestHeader('Content-type', 'application/json');
  req.send(JSON.stringify(query));
};
module.exports.request = request;

var random = function (bound) {
  // @todo CSPRNG?
  var bits = _I.bitSize(bound) < 8 ? 8 : _I.bitSize(bound);
  var rand = _I.randBigInt(bits, 1);
  while (_I.greater(rand, bound) || _I.equals(rand, bound) || _I.equals(rand, ZERO)) {
    rand = _I.randBigInt(bits);
  }
  return rand;
};
module.exports.random = random;

var randomList = function (count) {
  // @todo CSPRNG?
  // Fisher–Yates shuffle
  var list = [];
  for (var i = 0; i < count; i++) {
    list.push(i);
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
};
module.exports.randomList = randomList;

var shuffleList = function (list, shuffle) {
  if (arguments.length === 1) {
    shuffle = randomList(list.length);
  }

  var result = [list.length];
  for (var i = 0; i < list.length; i++) {
    result[i] = list[shuffle[i]];
  }

  return result;
};
module.exports.shuffleList = shuffleList;

var unshuffleList = function (list, shuffle) {
  var result = [list.length];
  for (var i = 0; i < list.length; i++) {
    result[shuffle[i]] = list[i];
  }

  return result;
};
module.exports.unshuffleList = unshuffleList;
