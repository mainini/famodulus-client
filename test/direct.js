/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */
'use strict';

var test = require('tape');
var direct = require('../lib/direct.js');

var server = 'http://localhost:8081/api/modexp/';

test('direct', function (t) {
  t.plan(8);
  direct.direct('2', '4', 'b', {server: server, brief: true}).then(result => {
    t.equal(result.b, undefined, 'result has no base');
    t.equal(result.e, undefined, 'result has no exponent');
    t.equal(result.m, undefined, 'result has no modulus');
    t.equal(result.r, '5', 'brief result is 5');
  });
  direct.direct('2', '4', 'b', {server: server, brief: false}).then(result => {
    t.equal(result.b, '2', 'result has base 2');
    t.equal(result.e, '4', 'result has exponent 4');
    t.equal(result.m, 'b', 'result has modulus 2');
    t.equal(result.r, '5', 'full result is 5');
  });
});

test('directs-single', function (t) {
  t.plan(12);

  var modexps = [{b: '2', e: '4', m: 'b'}];
  var defaults = {base: undefined, exponent: undefined, modulus: undefined};
  direct.directs(modexps, defaults, {server: server, brief: true}).then(result => {
    t.equal(result[0].r, '5', 'single modexp, no defaults, result is 5');
  });

  modexps = [{b: '2', e: undefined, m: undefined}];
  defaults = {base: '3', exponent: '4', modulus: 'b'};
  direct.directs(modexps, defaults, {server: server, brief: true}).then(result => {
    t.equal(result[0].r, '5', 'single modexp with base, result is 5');
  });

  modexps = [{b: undefined, e: '4', m: undefined}];
  defaults = {base: '2', exponent: '5', modulus: 'b'};
  direct.directs(modexps, defaults, {server: server, brief: true}).then(result => {
    t.equal(result[0].r, '5', 'single modexp with exponent, result is 5');
  });

  modexps = [{b: undefined, e: undefined, m: 'b'}];
  defaults = {base: '2', exponent: '4', modulus: 'c'};
  direct.directs(modexps, defaults, {server: server, brief: true}).then(result => {
    t.equal(result[0].r, '5', 'single modexp with modulus, result is 5');
  });

  modexps = [{b: undefined, e: undefined, m: undefined}];
  defaults = {base: '2', exponent: '4', modulus: 'b'};
  direct.directs(modexps, defaults, {server: server, brief: true}).then(result => {
    t.equal(result[0].b, undefined, 'result has no base');
    t.equal(result[0].e, undefined, 'result has no exponent');
    t.equal(result[0].m, undefined, 'result has no modulus');
    t.equal(result[0].r, '5', 'defaults only, brief result, result is 5');
  });

  modexps = [{b: '2', e: '4', m: 'b'}];
  defaults = {base: undefined, exponent: undefined, modulus: undefined};
  direct.directs(modexps, defaults, {server: server, brief: false}).then(result => {
    t.equal(result[0].b, '2', 'result has base 2');
    t.equal(result[0].e, '4', 'result has exponent 4');
    t.equal(result[0].m, 'b', 'result has modulus 2');
    t.equal(result[0].r, '5', 'no defaults, full result, result is 5');
  });
});

test('directs-multi', function (t) {
  t.plan(18);

  var modexps = [
    {b: undefined, e: undefined, m: undefined},
    {b: '2', e: undefined, m: undefined},
    {b: undefined, e: '4', m: undefined},
    {b: undefined, e: undefined, m: 'b'},
    {b: '2', e: '5', m: undefined},
    {b: '3', e: '5', m: 'b'}
  ];
  var defaults = {base: '2', exponent: '4', modulus: 'b'};

  direct.directs(modexps, defaults, {server: server, brief: true}).then(result => {
    t.equal(result[1].b, undefined, 'result[1] has no base');
    t.equal(result[2].e, undefined, 'result[2] has no exponent');
    t.equal(result[3].m, undefined, 'result[3] has no modulus');

    t.equal(result[0].r, '5', 'result[0] is 5');
    t.equal(result[1].r, '5', 'result[1] is 5');
    t.equal(result[2].r, '5', 'result[2] is 5');
    t.equal(result[3].r, '5', 'result[3] is 5');
    t.equal(result[4].r, 'a', 'result[4] is 5');
    t.equal(result[5].r, '1', 'result[5] is 1');
  });

  direct.directs(modexps, defaults, {server: server, brief: false}).then(result => {
    t.equal(result[1].b, '2', 'result[1] has base 2');
    t.equal(result[2].e, '4', 'result[2] has exponent 4');
    t.equal(result[3].m, 'b', 'result[3] has modulus b');

    t.equal(result[0].r, '5', 'result[0] is 5');
    t.equal(result[1].r, '5', 'result[1] is 5');
    t.equal(result[2].r, '5', 'result[2] is 5');
    t.equal(result[3].r, '5', 'result[3] is 5');
    t.equal(result[4].r, 'a', 'result[4] is 5');
    t.equal(result[5].r, '1', 'result[5] is 1');
  });
});
