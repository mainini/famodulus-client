'use strict';

var BI = require('BigInt');
var ZERO = BI.str2bigInt('0', 16, 0);
var ONE = BI.str2bigInt('1', 16, 0);

function _request(query, server, callback) {
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
}

function _rand(bound) {
    // @todo CSPRNG?
    var bits = BI.bitSize(bound) < 8 ? 8 : BI.bitSize(bound);
    var rand = BI.randBigInt(bits, 1);
    while (BI.greater(rand, bound) || BI.equals(rand, bound) || BI.equals(rand, ZERO)) {
        rand = BI.randBigInt(bits);
    }
    return rand;
}

function _randomList(count) {
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
}

function _shuffleList(list, shuffle) {
    // @todo implement
    console.log('shuffle');
    console.log(shuffle);
    return list;
}

function _unshuffleList(list, shuffle) {
    // @todo implement
    console.log('UNshuffle');
    console.log(shuffle);
    return list;
}

function FamodulusClient(servers, brief) {
    if (!(this instanceof FamodulusClient)) {
        return new FamodulusClient(servers, brief);
    }
    this.servers = servers;
    this.brief = typeof brief === 'undefined' ? true : brief;
}

FamodulusClient.prototype.modexp = function () {
    if (arguments.length === 4) {
        _request({brief: this.brief, modexps: [{b: arguments[0], e: arguments[1], m: arguments[2]}]}, this.servers[0], arguments[3]);
    } else if (arguments.length === 5) {
        _request({brief: this.brief, modexps: [{b: arguments[0], e: arguments[1], m: arguments[2]}]}, this.servers[arguments[3]], arguments[4]);
    } else {
        throw 'Invalid arguments!';
    }
};

FamodulusClient.prototype.modexps = function () {
    var defaultBase;
    var defaultExponent;
    var defaultModulus;
    var server = 0;
    var callback;

    // modexps are in arguments[0]
    if (arguments.length === 2) {
        callback = arguments[1];
    } else if (arguments.length === 3) {
        server = arguments[1];
        callback = arguments[2];
    } else if (arguments.length === 5) {
        defaultBase = arguments[1];
        defaultExponent = arguments[2];
        defaultModulus = arguments[3];
        callback = arguments[4];
    } else if (arguments.length === 6) {
        defaultBase = arguments[1];
        defaultExponent = arguments[2];
        defaultModulus = arguments[3];
        server = arguments[4];
        callback = arguments[5];
    } else {
        throw 'Invalid arguments!';
    }

    var modexps = [];
    for (var i = 0; i < arguments[0].length; i++) {
        modexps.push({b: arguments[0][i][0], e: arguments[0][i][1], m: arguments[0][i][2]});
    }
    _request({brief: this.brief, b: defaultBase, e: defaultExponent, m: defaultModulus, modexps: modexps}, this.servers[server], callback);
};

FamodulusClient.prototype.decExponent = function (u, a, p, checked, callback) {
    this.decsExponent([[u, a, p]], checked, function (result) {
        callback({r: result[0].r});
    });
};

FamodulusClient.prototype.decsExponent = function () {
    var defaultBase;
    var defaultExponent;
    var defaultModulus;
    var checked;
    var callback;

    // @todo test
    // modexps are in arguments[0]
    if (arguments.length === 3) {
        checked = arguments[1];
        callback = arguments[2];
    } else if (arguments.length === 6) {
        defaultBase = arguments[1];
        defaultExponent = arguments[2];
        defaultModulus = arguments[3];
        checked = arguments[4];
        callback = arguments[5];
    } else {
        throw 'Invalid arguments!';
    }

    // @todo errorhandling!
    var modexps = [];
    for (var i = 0; i < arguments[0].length; i++) {
        modexps.push([typeof arguments[0][i][0] === 'undefined' ? defaultBase : arguments[0][i][0],
            typeof arguments[0][i][1] === 'undefined' ? defaultExponent : arguments[0][i][1],
            typeof arguments[0][i][2] === 'undefined' ? defaultModulus : arguments[0][i][2]]);
    }

    //////////////// Start of algorithm ///////////////
    var moduli = [];
    var modexpsB = [];
    var modexpsC = [];

    for (var i = 0; i < modexps.length; i++) {
        var a = BI.str2bigInt(modexps[i][1], 16, 0);
        var p = BI.str2bigInt(modexps[i][2], 16, 0);
        var q = BI.sub(p, ONE);                             // q = p-1
        var b = _rand(q);
        var c = BI.mod(BI.sub(BI.add(a, q), b), q);         // c = (a+q)-b mod q

        moduli.push(p);
        modexpsB.push([modexps[i][0], BI.bigInt2str(b, 16), modexps[i][2]]);
        modexpsC.push([modexps[i][0], BI.bigInt2str(c, 16), modexps[i][2]]);

        if (checked) {
            moduli.push(p);
            var rStr = BI.bigInt2str(_rand(q), 16);
            modexpsB.push([modexps[i][0], rStr, modexps[i][2]]);
            modexpsC.push([modexps[i][0], rStr, modexps[i][2]]);
        }
    }

    // calculate u^b*u^c mod p for all results with corresponding modulus
    function resultCallback(resB, resC, callback) {
        var results = [];
        if (typeof resB.r !== 'undefined') {                // single result
            results.push({r: BI.bigInt2str(BI.multMod(BI.str2bigInt(resB.r, 16, 0), BI.str2bigInt(resC.r, 16, 0), moduli[0]), 16)});
        } else {                                            // multiple results
            if (checked) {
                var dataLength = resB.length / 2;
                for (i = 0; i < dataLength; i++) {
                    var checkB = resB.splice(i + 1, 1)[0];
                    var checkC = resC.splice(i + 1, 1)[0];
                    if (checkB.r !== checkC.r) {
                        throw 'Check failed';   // @todo errorhandling!
                    }
                }
            }
            for (var i = 0; i < resB.length; i++) {
                results.push({r: BI.bigInt2str(BI.multMod(BI.str2bigInt(resB[i].r, 16, 0), BI.str2bigInt(resC[i].r, 16, 0), moduli[i]), 16)});
            }
        }
        callback(results);
    }

    var listShuffle = _randomList(moduli.length);
    var serverPermutation = _randomList(2);
    var resultB, resultC;
    this.modexps(_shuffleList(modexpsB, listShuffle), serverPermutation[0], function (result) {
        resultB = result;
        if (typeof resultC !== 'undefined') {
            resultCallback(_unshuffleList(resultB, listShuffle), _unshuffleList(resultC, listShuffle), callback);
            resultC = undefined;
        }
    });
    this.modexps(_shuffleList(modexpsC, listShuffle), serverPermutation[1], function (result) {
        resultC = result;
        if (typeof resultB !== 'undefined') {
            resultCallback(_unshuffleList(resultB, listShuffle), _unshuffleList(resultC, listShuffle), callback);
            resultB = undefined;
        }
    });
};

module.exports = FamodulusClient;