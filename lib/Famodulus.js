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
    var bi = require('BigInt');

    var one = bi.str2bigInt('1', 16, 0);
    var zero = bi.str2bigInt('0', 16, 0);
    var a = bi.str2bigInt(aStr, 16, 0);
    var p = bi.str2bigInt(pStr, 16, 0);
    var q = bi.sub(p, one);     // q = p-1

    var qbits = bi.bitSize(q) < 8 ? 8 : bi.bitSize(q);
    var b = bi.randBigInt(qbits,1);
console.log("first b: " + bi.bigInt2str(b,16));
    while (bi.greater(b, q) || bi.equals(b, q) || bi.equals(b,zero)) {
        b = bi.randBigInt(qbits);
console.log("b: " + bi.bigInt2str(b,16));
    }


    var c = bi.mod(bi.sub(a, b), q);
console.log("c: " + bi.bigInt2str(c,16));
    var resultB, resultC;

// @todo randomize servers
    self.modexp(uStr, bi.bigInt2str(b,16), pStr, function (result) {
        resultB = result.r;
        if (typeof resultC !== 'undefined') {
console.log("resultB: " + resultB + " resultC: " + resultC);
            callback({r: bi.bigInt2str(bi.multMod(bi.str2bigInt(resultB, 16, 0), bi.str2bigInt(resultC, 16, 0), p),16)});
            resultC = undefined;
        }
    });
    self.modexp(uStr, bi.bigInt2str(c,16), pStr, function (result) {
        resultC = result.r;
        if (typeof resultB !== 'undefined') {
console.log("resultB: " + resultB + " resultC: " + resultC);
            callback({r: bi.bigInt2str(bi.multMod(bi.str2bigInt(resultB, 16, 0), bi.str2bigInt(resultC, 16, 0), p),16)});
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