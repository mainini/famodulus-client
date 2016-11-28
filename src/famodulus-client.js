module.exports = FamodulusClient;

function FamodulusClient(servers) {
    this.servers = servers;
}

FamodulusClient.prototype.modexp = function (base, exponent, modulus, callback) {
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