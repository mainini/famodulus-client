'use strict';

var _I = require('BigInt');
var util = require('./util.js');
var direct = require('./direct.js');

function decExponent (base, exponent, modulus, options, callback) {
  decExponents([{b: base, e: exponent, m: modulus}], {}, options, function (result) {
    callback({r: result[0].r});
  });
}

function decExponents (modexps, defaults, options, callback) {
  // fill in default values for each modexp, where missing
  var modexpsWithDefaults = modexps.map(function (modexp) {
    return {b: modexp.b || defaults.base, e: modexp.e || defaults.exponent, m: modexp.m || defaults.modulus};
  });

  // ======= 1.) split exponents and prepare a list with modexps for each server =======

  var moduli = [];            // moduli of modexps may be different, we need to remember them for final multiplication
  var modexpsB = [];          // modexps with exponent b
  var modexpsC = [];          // modexps with exponent c
  modexpsWithDefaults.forEach(function (modexp) {
    var a = _I.str2bigInt(modexp.e, 16, 0);             // a <- exponent
    var p = _I.str2bigInt(modexp.m, 16, 0);             // p <- modulus
    var q = _I.sub(p, util.ONE);                        // q <- p-1 (p is prime by definition!)
    var b = util.random(q);                             // b <- random in Z_q
    var c = _I.mod(_I.sub(_I.add(a, q), b), q);         // c <- (a+q)-b mod q, we add q first to ensure c > 0
    //                                                                (BigInt returns 2s-complement otherwise)

    // sanity check, a has to be in Z_q
    if (_I.greater(a, q) || _I.equals(a, q)) {
      throw 'a not in Z_q'; // @todo errorhandling
    }

    // add modexp to lists
    moduli.push(p);
    modexpsB.push({b: modexp.b, e: _I.bigInt2str(b, 16), m: modexp.m});
    modexpsC.push({b: modexp.b, e: _I.bigInt2str(c, 16), m: modexp.m});

    // if checked calculations are desired, add a modexp with randomized
    // exponent but same base and modulus for each server
    if (options.checked) {
      moduli.push(p);
      var rStr = _I.bigInt2str(util.random(q), 16);
      modexpsB.push({b: modexp.b, e: rStr, m: modexp.m});
      modexpsC.push({b: modexp.b, e: rStr, m: modexp.m});
    }
  });

  // ======= 2.) Randomize order of modexps and send them in random order to servers =======

  var listShuffle = util.randomList(moduli.length);
  var servers = util.shuffleList(options.servers);
  var resultsB, resultsC;

  // Server 1
  direct.directs(util.shuffleList(modexpsB, listShuffle), {}, {server: servers[0]}, function (result) {
    resultsB = result;
    if (resultsC) {
      _resultCallback(util.unshuffleList(resultsB, listShuffle), util.unshuffleList(resultsC, listShuffle), callback);
    }
  });

  // Server 2
  direct.directs(util.shuffleList(modexpsC, listShuffle), {}, {server: servers[1]}, function (result) {
    resultsC = result;
    if (resultsB) {
      _resultCallback(util.unshuffleList(resultsB, listShuffle), util.unshuffleList(resultsC, listShuffle), callback);
    }
  });

  // ======= 3.) having obtained all results, multiply them ( u^b*u^c mod p ) and return =======

  function _resultCallback (resB, resC, callback) {
    // check if the test-values for checkability correspond
    if (options.checked) {
      var dataLength = resB.length / 2;
      for (i = 0; i < dataLength; i++) {
        var checkB = resB.splice(i + 1, 1)[0];
        var checkC = resC.splice(i + 1, 1)[0];
        if (checkB.r !== checkC.r) {  // @todo test with malicious server
          throw 'Check failed';      // @todo errorhandling
        }
      }
    }

    // multiply results and return them
    var results = [resB.length];
    for (var i = 0; i < resB.length; i++) {
      results[i] = {r: _I.bigInt2str(_I.multMod(_I.str2bigInt(resB[i].r, 16, 0), _I.str2bigInt(resC[i].r, 16, 0), moduli[i]), 16)};
    }
    callback(results);
  }
}

module.exports = {decExponent: decExponent, decExponents: decExponents};
