var bigInt = require('big-integer');

function Famodulus(servers) {
    this.servers = servers;
}

Famodulus.prototype.modexp = function (base, exponent, modulus, callback) {
    var query = {'modexps': [{'b': base, 'e': exponent, 'm': modulus}]};

    var req = new XMLHttpRequest();
    req.addEventListener('load', function () {
        var res = JSON.parse(this.responseText);
        callback(res.modexps[0].r);
    });

    req.open('POST', this.servers[0]);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(query));
};

if (typeof window !== 'undefined') {
    window.bigInt = bigInt;
    window.Famodulus = Famodulus;
}

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = Famodulus;
}