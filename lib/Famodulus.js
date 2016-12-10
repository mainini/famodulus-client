function FamodulusClient(servers, brief) {
    'use strict';
    this.servers = servers;
    this.brief = typeof(brief) === 'undefined' ? true : brief;
}

FamodulusClient.prototype.modexp = function (base, exponent, modulus, callback) {
    'use strict';
    var query = {brief:this.brief, modexps: [{b:base, e:exponent, m:modulus}]};

    var req = new XMLHttpRequest();
    req.addEventListener('load', function () {
        var res = JSON.parse(this.responseText);
        callback(res.modexps[0].r);
    });

    req.open('POST', this.servers[0]);
    req.setRequestHeader('Content-type', 'application/json');
    req.send(JSON.stringify(query));
};

if (typeof(module) !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = FamodulusClient;
}