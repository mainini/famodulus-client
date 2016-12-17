function FamodulusClient(servers, brief) {
    'use strict';
    this.servers = servers;
    this.brief = typeof brief === 'undefined' ? true : brief;
}

FamodulusClient.prototype._request = function (query, server, callback) {
    'use strict';
    query.brief = this.brief;
    var req = new XMLHttpRequest();
    req.addEventListener('load', function () {
        var res = JSON.parse(this.responseText);
        if (res.modexps.length === 1) {
            callback(res.modexps[0]);
        } else {
            callback(res.modexps);
        }
    });

    req.open('POST', this.servers[server]);
    req.setRequestHeader('Content-type', 'application/json');
    req.send(JSON.stringify(query));
};

FamodulusClient.prototype._rand = function (bound) {
    'use strict';
    var BI = require('BigInt');
    var ZERO = BI.str2bigInt('0', 16, 0);

    var bits = BI.bitSize(bound) < 8 ? 8 : BI.bitSize(bound);
    var rand = BI.randBigInt(bits, 1);
    while (BI.greater(rand, bound) || BI.equals(rand, bound) || BI.equals(rand, ZERO)) {
        rand = BI.randBigInt(bits);
    }
    return rand;
};

FamodulusClient.prototype.modexp = function () {
    'use strict';
    if(arguments.length === 4) {
        this._request({modexps: [{b: arguments[0], e: arguments[1], m: arguments[2]}]}, 0, arguments[3]);
    } else if (arguments.length === 5) {
        this._request({modexps: [{b: arguments[0], e: arguments[1], m: arguments[2]}]}, arguments[3], arguments[4]);
    } else {
        throw 'Invalid arguments!';
    }
};

FamodulusClient.prototype.modexps = function () {
    'use strict';
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
    this._request({b: defaultBase, e: defaultExponent, m: defaultModulus, modexps: modexps}, server, callback);
};

FamodulusClient.prototype.decExponent = function (u, a, p, checked, callback) {
    'use strict';
    this.decsExponent([[u, a, p]], checked, function (result) {
        callback({r: result[0].r});
    });
};

FamodulusClient.prototype.decsExponent = function () {
    'use strict';
    var BI = require('BigInt');
    var ONE = BI.str2bigInt('1', 16, 0);

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
        var b = this._rand(q);
        var c = BI.mod(BI.sub(BI.add(a, q), b), q);         // c = (a+q)-b mod q

        moduli.push(p);
        modexpsB.push([modexps[i][0], BI.bigInt2str(b, 16), modexps[i][2]]);
        modexpsC.push([modexps[i][0], BI.bigInt2str(c, 16), modexps[i][2]]);
    }

    // calculate u^b*u^c mod p for all results with corresponding modulus
    function resultCallback(resB, resC, callback) {
        var results = [];
        if (typeof resB.r !== 'undefined') {                // single result
            results.push({r: BI.bigInt2str(BI.multMod(BI.str2bigInt(resB.r, 16, 0), BI.str2bigInt(resC.r, 16, 0), moduli[0]), 16)});
        } else {                                            // multiple results
            for (var i = 0; i < resB.length; i++) {
                results.push({r: BI.bigInt2str(BI.multMod(BI.str2bigInt(resB[i].r, 16, 0), BI.str2bigInt(resC[i].r, 16, 0), moduli[i]), 16)});
            }
        }
        callback(results);
    }

    // @todo randomize servers, checkability
    var resultB, resultC;
    this.modexps(modexpsB, function (result) {
        resultB = result;
        if (typeof resultC !== 'undefined') {
            resultCallback(resultB, resultC, callback);
            resultC = undefined;
        }
    });
    this.modexps(modexpsC, function (result) {
        resultC = result;
        if (typeof resultB !== 'undefined') {
            resultCallback(resultB, resultC, callback);
            resultB = undefined;
        }
    });
};

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = FamodulusClient;
}