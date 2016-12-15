function FamodulusClient(servers, brief) {
    'use strict';
    this.servers = servers;
    this.brief = typeof brief === 'undefined' ? true : brief;
}

FamodulusClient.prototype._request = function (query, callback) {
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

    req.open('POST', this.servers[0]);
    req.setRequestHeader('Content-type', 'application/json');
    req.send(JSON.stringify(query));
};

FamodulusClient.prototype.modexp = function (base, exponent, modulus, callback) {
    'use strict';
    this._request({modexps: [{b: base, e: exponent, m: modulus}]}, callback);
};

FamodulusClient.prototype.modexps = function () {
    'use strict';
    var modexps = arguments[0];
    var defaultBase;
    var defaultExponent;
    var defaultModulus;
    var callback;

    if (arguments.length === 2) {
        defaultBase = undefined;
        defaultExponent = undefined;
        defaultModulus = undefined;
        callback = arguments[1];
    } else if (arguments.length === 5) {
        defaultBase = arguments[1];
        defaultExponent = arguments[2];
        defaultModulus = arguments[3];
        callback = arguments[4];
    } else {
        throw 'Invalid arguments!';
    }

    var queryModexps = [];
    for (var i = 0; i < modexps.length; i++) {
        queryModexps.push({b: modexps[i][0], e: modexps[i][1], m: modexps[i][2]});
    }
    this._request({b: defaultBase, e: defaultExponent, m: defaultModulus, modexps: queryModexps}, callback);
};

FamodulusClient.prototype.decExponent = function (uStr, aStr, pStr, callback) {
    'use strict';
    this.decsExponent([[uStr, aStr, pStr]], function (result) {
        callback({r: result[0].r});
    });
};

FamodulusClient.prototype.decsExponent = function () {
    'use strict';
    var self = this;
    var BI = require('BigInt');

    var modexps = arguments[0];
    var defaultBase;
    var defaultExponent;
    var defaultModulus;
    var callback;

    // @todo test
    if (arguments.length === 2) {
        defaultBase = undefined;
        defaultExponent = undefined;
        defaultModulus = undefined;
        callback = arguments[1];
    } else if (arguments.length === 5) {
        defaultBase = arguments[1];
        defaultExponent = arguments[2];
        defaultModulus = arguments[3];
        callback = arguments[4];
    } else {
        throw 'Invalid arguments!';
    }

    // @todo errorhandling!
    var queryModexps = [];
    for (var i = 0; i < modexps.length; i++) {
        queryModexps.push([typeof modexps[i][0] === 'undefined' ? defaultBase : modexps[i][0],
            typeof modexps[i][1] === 'undefined' ? defaultExponent : modexps[i][1],
            typeof modexps[i][2] === 'undefined' ? defaultModulus : modexps[i][2]]);
    }

    var zero = BI.str2bigInt('0', 16, 0);
    var one = BI.str2bigInt('1', 16, 0);

    var ps = [];
    var modexpsB = [];
    var modexpsC = [];
    for (var i = 0; i < queryModexps.length; i++) {
        var a = BI.str2bigInt(queryModexps[i][1], 16, 0);
        var p = BI.str2bigInt(queryModexps[i][2], 16, 0);
        var q = BI.sub(p, one);                         // q = p-1

        var qbits = BI.bitSize(q) < 8 ? 8 : BI.bitSize(q);
        var b = BI.randBigInt(qbits, 1);
        while (BI.greater(b, q) || BI.equals(b, q) || BI.equals(b, zero)) {
            b = BI.randBigInt(qbits);
        }

        var c = BI.mod(BI.sub(BI.add(a, q), b), q);      // c = (a+q)-b mod q

        ps.push(p);
        modexpsB.push([queryModexps[i][0], BI.bigInt2str(b, 16), queryModexps[i][2]]);
        modexpsC.push([queryModexps[i][0], BI.bigInt2str(c, 16), queryModexps[i][2]]);
    }

    function resultCB(bres, cres, callback) {
        var results = [];
        if (typeof bres.r !== 'undefined') {
            results.push({r: BI.bigInt2str(BI.multMod(BI.str2bigInt(bres.r, 16, 0), BI.str2bigInt(cres.r, 16, 0), ps[0]), 16)});
        } else {
            for (var i = 0; i < bres.length; i++) {
                results.push({r: BI.bigInt2str(BI.multMod(BI.str2bigInt(bres[i].r, 16, 0), BI.str2bigInt(cres[i].r, 16, 0), ps[i]), 16)});
            }
        }
        callback(results);
    }

    // @todo randomize servers, checkability
    var resultB, resultC;
    self.modexps(modexpsB, function (result) {
        resultB = result;
        if (typeof resultC !== 'undefined') {
            resultCB(resultB, resultC, callback);
            resultC = undefined;
        }
    });
    self.modexps(modexpsC, function (result) {
        resultC = result;
        if (typeof resultB !== 'undefined') {
            resultCB(resultB, resultC, callback);
            resultB = undefined;
        }
    });
};

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = FamodulusClient;
}