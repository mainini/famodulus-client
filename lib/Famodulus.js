function FamodulusClient(servers, brief) {
    'use strict';
    this.servers = servers;
    this.brief = typeof brief === 'undefined' ? true : brief;
    this.bi = typeof window !== 'undefined' ? window.BigInt : BigInt;
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

FamodulusClient.prototype.decExponent = function (u, a, m, callback) {
    'use strict';
    var self = this;

    var b = self.bi.rand(a.length);
    var c = self.bi.sub(a, b, m);
    var resultB, resultC;

// @todo randomize servers
    self.modexp(u, b, m, function (result) {
        resultB = result.r;
        if (typeof resultC !== 'undefined') {
            callback({r: self.bi.mul(resultB, resultC, m)});
            resultC = undefined;
        }
    });
    self.modexp(u, c, m, function (result) {
        resultC = result.r;
        if (typeof resultB !== 'undefined') {
            callback({r: self.bi.mul(resultB, resultC, m)});
            resultB = undefined;
        }
    });
};

FamodulusClient.prototype.decsExponent = function (u, a, m, callback) {
    'use strict';
    console.log('Not yet implemented!');
};

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = FamodulusClient;
}