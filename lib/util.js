'use strict';

var _I = require('BigInt');
var ZERO = _I.str2bigInt('0', 16, 0);
var ONE = _I.str2bigInt('1', 16, 0);

module.exports.ZERO = ZERO;
module.exports.ONE = ONE;

module.exports.request = function (query, server, callback) {
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

module.exports.random = function (bound) {
  // @todo CSPRNG?
  var bits = _I.bitSize(bound) < 8 ? 8 : _I.bitSize(bound);
  var rand = _I.randBigInt(bits, 1);
  while (_I.greater(rand, bound) || _I.equals(rand, bound) || _I.equals(rand, ZERO)) {
    rand = _I.randBigInt(bits);
  }
  return rand;
};

module.exports.randomList = function (count) {
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

module.exports.shuffleList = function (list, shuffle) {
  // @todo implement
  return list;
};

module.exports.unshuffleList = function (list, shuffle) {
  // @todo implement
  return list;
};
