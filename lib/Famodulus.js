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
        defaultModulus = arguments[2];
        callback = arguments[4];
    }

    var queryModexps = [];
    for (var i = 0; i < modexps.length; i++) {
        queryModexps.push({b: modexps[i][0], e: modexps[i][1], m: modexps[i][2]});
    }
    this._request({b:defaultBase, e:defaultExponent, m:defaultModulus, modexps: queryModexps}, callback);
};

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = FamodulusClient;
}