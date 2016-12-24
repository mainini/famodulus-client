'use strict';

var _I = require('BigInt');
var util = require('./util.js');
var direct = require('./direct.js');

var decExponent = function (base, exponent, modulus, options, callback) {
  decExponents([{b: base, e: exponent, m: modulus}], {}, options, function (result) {
    callback({r: result[0].r});
  });
};
module.exports.decExponent = decExponent;

var decExponents = function (modexps, defaults, options, callback) {
  var modexpsWithDefaults = modexps.map(function (modexp) {
    return {b: modexp.b || defaults.base, e: modexp.e || defaults.exponent, m: modexp.m || defaults.modulus};
  });

  //////////////// Start of algorithm ///////////////
  var moduli = [];
  var modexpsB = [];
  var modexpsC = [];

  modexpsWithDefaults.forEach(function (modexp) {
    var a = _I.str2bigInt(modexp.e, 16, 0);
    var p = _I.str2bigInt(modexp.m, 16, 0);
    var q = _I.sub(p, util.ONE);                             // q = p-1
    var b = util.random(q);
    var c = _I.mod(_I.sub(_I.add(a, q), b), q);         // c = (a+q)-b mod q

    moduli.push(p);
    modexpsB.push({b: modexp.b, e: _I.bigInt2str(b, 16), m: modexp.m});
    modexpsC.push({b: modexp.b, e: _I.bigInt2str(c, 16), m: modexp.m});

    if (options.checked) {
      moduli.push(p);
      var rStr = _I.bigInt2str(util.random(q), 16);
      modexpsB.push({b: modexp.b, e: rStr, m: modexp.m});
      modexpsC.push({b: modexp.b, e: rStr, m: modexp.m});
    }
  });

  // calculate u^b*u^c mod p for all results with corresponding modulus
  function resultCallback (resB, resC, callback) {
    if (resB.r) {                // single result
      callback([{r: _I.bigInt2str(_I.multMod(_I.str2bigInt(resB.r, 16, 0), _I.str2bigInt(resC.r, 16, 0), moduli[0]), 16)}]);
    } else {                                            // multiple results
      if (options.checked) {
        var dataLength = resB.length / 2;
        for (i = 0; i < dataLength; i++) {
          var checkB = resB.splice(i + 1, 1)[0];
          var checkC = resC.splice(i + 1, 1)[0];
          if (checkB.r !== checkC.r) {
            throw 'Check failed';      // @todo proper error handling
          }
        }
      }

      var results = [];
      for (var i = 0; i < resB.length; i++) {
        results.push({r: _I.bigInt2str(_I.multMod(_I.str2bigInt(resB[i].r, 16, 0), _I.str2bigInt(resC[i].r, 16, 0), moduli[i]), 16)});
      }
      callback(results);
    }
  }

  var listShuffle = util.randomList(moduli.length);
  var servers = util.shuffleList(options.servers);
  var resultB, resultC;

  direct.directs(util.shuffleList(modexpsB, listShuffle), {}, {server: servers[0]}, function (result) {
    resultB = result;
    if (resultC) {
      resultCallback(util.unshuffleList(resultB, listShuffle), util.unshuffleList(resultC, listShuffle), callback);
      resultC = undefined;
    }
  });

  direct.directs(util.shuffleList(modexpsC, listShuffle), {}, {server: servers[1]}, function (result) {
    resultC = result;
    if (resultB) {
      resultCallback(util.unshuffleList(resultB, listShuffle), util.unshuffleList(resultC, listShuffle), callback);
      resultB = undefined;
    }
  });
};
module.exports.decExponents = decExponents;
