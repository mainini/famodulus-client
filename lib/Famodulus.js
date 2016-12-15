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
    }

    var queryModexps = [];
    for (var i = 0; i < modexps.length; i++) {
        queryModexps.push({b: modexps[i][0], e: modexps[i][1], m: modexps[i][2]});
    }
    this._request({b: defaultBase, e: defaultExponent, m: defaultModulus, modexps: queryModexps}, callback);
};

FamodulusClient.prototype.decExponent = function (uStr, aStr, pStr, callback) {
    'use strict';
    var self = this;
    var BI = require('BigInt');

    var zero = BI.str2bigInt('0', 16, 0);
    var one = BI.str2bigInt('1', 16, 0);

    var a = BI.str2bigInt(aStr, 16, 0);
    var p = BI.str2bigInt(pStr, 16, 0);
    var q = BI.sub(p, one);                         // q = p-1

    var qbits = BI.bitSize(q) < 8 ? 8 : BI.bitSize(q);
    var b = BI.randBigInt(qbits, 1);
    while (BI.greater(b, q) || BI.equals(b, q) || BI.equals(b, zero)) {
        b = BI.randBigInt(qbits);
    }

    var c = BI.mod(BI.sub(BI.add(a, q), b), q);      // c = (a+q)-b mod q

    var resultB, resultC;

    // @todo randomize servers
    self.modexp(uStr, BI.bigInt2str(b, 16), pStr, function (result) {
        resultB = result.r;
        if (typeof resultC !== 'undefined') {
            callback({r: BI.bigInt2str(BI.multMod(BI.str2bigInt(resultB, 16, 0), BI.str2bigInt(resultC, 16, 0), p), 16)});
            resultC = undefined;
        }
    });
    self.modexp(uStr, BI.bigInt2str(c, 16), pStr, function (result) {
        resultC = result.r;
        if (typeof resultB !== 'undefined') {
            callback({r: BI.bigInt2str(BI.multMod(BI.str2bigInt(resultB, 16, 0), BI.str2bigInt(resultC, 16, 0), p), 16)});
            resultB = undefined;
        }
    });
};

FamodulusClient.prototype.decsExponent = function (u, a, p, callback) {
    'use strict';
    console.log('Not yet implemented!');
};

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = FamodulusClient;
}