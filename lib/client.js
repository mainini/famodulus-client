'use strict';

var direct = require('./direct.js');
var dec = require('./dec.js');

function FamodulusClient (servers, brief) {
  if (!(this instanceof FamodulusClient)) return new FamodulusClient(servers, brief);

  this.servers = servers;
  this.brief = arguments.length === 2 ? brief : true;
}

FamodulusClient.prototype.direct = function (base, exponent, modulus, server) {
  if (arguments.length === 3) return direct.direct(base, exponent, modulus, {server: this.servers[0], brief: this.brief});
  else return direct.direct(base, exponent, modulus, {server: this.servers[server], brief: this.brief});
};

FamodulusClient.prototype.directs = function (modexps, defaultBase, defaultExponent, defaultModulus, server) {
  if (arguments.length === 1) server = 0;
  else if (arguments.length === 2) server = defaultBase;
  else if (arguments.length === 4) server = 0;

  return direct.directs(modexps.map(modexp => ({b: modexp[0], e: modexp[1], m: modexp[2]})),
      {base: defaultBase, exponent: defaultExponent, modulus: defaultModulus},
      {brief: this.brief, server: this.servers[server]});
};

FamodulusClient.prototype.decExponent = function (base, exponent, modulus, checked) {
  return dec.decExponent(base, exponent, modulus,
      {brief: this.brief, servers: this.servers, checked: checked});
};

FamodulusClient.prototype.decExponents = function (modexps, defaultBase, defaultExponent, defaultModulus, checked) {
  if (arguments.length === 2) checked = defaultBase;

  return dec.decExponents(modexps.map(modexp => ({b: modexp[0], e: modexp[1], m: modexp[2]})),
      {base: defaultBase, exponent: defaultExponent, modulus: defaultModulus},
      {brief: this.brief, servers: this.servers, checked: checked});
};

module.exports = FamodulusClient;
