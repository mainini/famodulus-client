/*jshint node:true, eqeqeq:true, esversion:5, bitwise:true, curly:true, immed:true, indent:4, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:single, undef:true, unused:true, trailing:true, white:false, forin:true, futurehostile:true, nonbsp:true, nonew:true, strict:true */
/* globals XMLHttpRequest */

function FamodulusClient(servers) {
    'use strict';
    this.servers = servers;
}

FamodulusClient.prototype.modexp = function (base, exponent, modulus, callback) {
    'use strict';
    var query = {'modexps': [{'b': base, 'e': exponent, 'm': modulus}]};

    var req = new XMLHttpRequest();
    req.addEventListener('load', function () {
        var res = JSON.parse(this.responseText);
        callback(res.modexps[0].r);
    });

    req.open('POST', this.servers[0]);
    req.setRequestHeader('Content-type", "application/json');
    req.send(JSON.stringify(query));
};

module.exports = FamodulusClient;