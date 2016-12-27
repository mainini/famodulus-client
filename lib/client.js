'use strict';

var direct = require('./direct.js');
var dec = require('./dec.js');

function FamodulusClient (servers, brief) {
  if (!(this instanceof FamodulusClient)) return new FamodulusClient(servers, brief);

  this.servers = servers;
  this.brief = brief || true;
}

FamodulusClient.prototype.direct = function (base, exponent, modulus, server, callback) {
  if (arguments.length === 4) {
    callback = server;
    direct.direct(base, exponent, modulus, {server: this.servers[0], brief: this.brief}, callback);
  } else {
    direct.direct(base, exponent, modulus, {server: this.servers[server], brief: this.brief}, callback);
  }
};

FamodulusClient.prototype.directs = function (modexps, defaultBase, defaultExponent, defaultModulus, server, callback) {
  if (arguments.length === 2) {
    callback = defaultBase;
    server = 0;
  } else if (arguments.length === 3) {
    callback = defaultExponent;
    server = defaultBase;
  } else if (arguments.length === 5) {
    callback = server;
    server = 0;
  }

  direct.directs(modexps.map(function (modexp) {
    return {b: modexp[0], e: modexp[1], m: modexp[2]};
  }), {base: defaultBase, exponent: defaultExponent, modulus: defaultModulus},
      {brief: this.brief, server: this.servers[server]}, callback);
};

FamodulusClient.prototype.decExponent = function (base, exponent, modulus, checked, callback) {
  dec.decExponent(base, exponent, modulus,
      {brief: this.brief, servers: this.servers, checked: checked},
      callback);
};

FamodulusClient.prototype.decExponents = function (modexps, defaultBase, defaultExponent, defaultModulus, checked, callback) {
  if (arguments.length === 3) {
    checked = defaultBase;
    callback = defaultExponent;
  }

  dec.decExponents(modexps.map(function (modexp) {
    return {b: modexp[0], e: modexp[1], m: modexp[2]};
  }), {base: defaultBase, exponent: defaultExponent, modulus: defaultModulus},
      {brief: this.brief, servers: this.servers, checked: checked},
      callback);
};

module.exports = FamodulusClient;
