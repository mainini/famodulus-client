/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */
'use strict';

var test = require('tape');
var direct = require('../lib/direct.js');
var dec = require('../lib/dec.js');

var server1 = 'http://localhost:8081/api/modexp/';
var server2 = 'http://localhost:8081/api/modexp/';

var algorithmsSingle = [
  {func: direct.direct, options: {server: server1, brief: true}},
  {func: dec.decExponent, options: {servers: [server1, server2], brief: true}},
  {func: dec.decExponent, options: {servers: [server1, server2], checked: true, brief: true}}
];

var algorithmsMulti = [
  {func: direct.directs, options: {server: server1, brief: true}},
  {func: dec.decExponents, options: {servers: [server1, server2], brief: true}},
  {func: dec.decExponents, options: {servers: [server1, server2], checked: true, brief: true}}
];

test('single', function (t) {
  t.plan(8 * algorithmsSingle.length);

  algorithmsSingle.forEach(alg => {
    var optionsBrief = Object.assign({}, alg.options);

    alg.func('2', '4', 'b', optionsBrief).then(result => {
      t.equal(result.b, undefined, 'result has no base');
      t.equal(result.e, undefined, 'result has no exponent');
      t.equal(result.m, undefined, 'result has no modulus');
      t.equal(result.r, '5', 'brief result is 5');
    });

    var optionsFull = Object.assign({}, alg.options);
    optionsFull.brief = false;

    alg.func('2', '4', 'b', optionsFull).then(result => {
      t.equal(result.b, '2', 'result has base 2');
      t.equal(result.e, '4', 'result has exponent 4');
      t.equal(result.m, 'b', 'result has modulus 2');
      t.equal(result.r, '5', 'full result is 5');
    });
  });
});

test('multi-single', function (t) {
  t.plan(12 * algorithmsMulti.length);

  algorithmsMulti.forEach(alg => {
    var optionsBrief = Object.assign({}, alg.options);

    var modexps = [{b: '2', e: '4', m: 'b'}];
    var defaults = {b: undefined, e: undefined, m: undefined};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].r, '5', 'single modexp, no defaults, result is 5');
    });

    modexps = [{b: '2', e: undefined, m: undefined}];
    defaults = {b: '3', e: '4', m: 'b'};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].r, '5', 'single modexp with base, result is 5');
    });

    modexps = [{b: undefined, e: '4', m: undefined}];
    defaults = {b: '2', e: '5', m: 'b'};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].r, '5', 'single modexp with exponent, result is 5');
    });

    modexps = [{b: undefined, e: undefined, m: 'b'}];
    defaults = {b: '2', e: '4', m: 'c'};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].r, '5', 'single modexp with modulus, result is 5');
    });

    modexps = [{b: undefined, e: undefined, m: undefined}];
    defaults = {b: '2', e: '4', m: 'b'};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].b, undefined, 'result has no base');
      t.equal(result[0].e, undefined, 'result has no exponent');
      t.equal(result[0].m, undefined, 'result has no modulus');
      t.equal(result[0].r, '5', 'defaults only, brief result, result is 5');
    });

    var optionsFull = Object.assign({}, alg.options);
    optionsFull.brief = false;

    modexps = [{b: '2', e: '4', m: 'b'}];
    defaults = {b: undefined, e: undefined, m: undefined};
    alg.func(modexps, defaults, optionsFull).then(result => {
      t.equal(result[0].b, '2', 'result has base 2');
      t.equal(result[0].e, '4', 'result has exponent 4');
      t.equal(result[0].m, 'b', 'result has modulus 2');
      t.equal(result[0].r, '5', 'no defaults, full result, result is 5');
    });
  });
});

test('multi-multi', function (t) {
  t.plan(18 * algorithmsMulti.length);

  algorithmsMulti.forEach(alg => {
    var optionsBrief = Object.assign({}, alg.options);

    var modexps = [
      {b: undefined, e: undefined, m: undefined},
      {b: '2', e: undefined, m: undefined},
      {b: undefined, e: '4', m: undefined},
      {b: undefined, e: undefined, m: 'b'},
      {b: '2', e: '5', m: undefined},
      {b: '3', e: '5', m: 'b'}
    ];
    var defaults = {b: '2', e: '4', m: 'b'};

    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[1].b, undefined, 'result[1] has no base');
      t.equal(result[2].e, undefined, 'result[2] has no exponent');
      t.equal(result[3].m, undefined, 'result[3] has no modulus');

      t.equal(result[0].r, '5', 'result[0] is 5');
      t.equal(result[1].r, '5', 'result[1] is 5');
      t.equal(result[2].r, '5', 'result[2] is 5');
      t.equal(result[3].r, '5', 'result[3] is 5');
      t.equal(result[4].r.toLowerCase(), 'a', 'result[4] is 5');
      t.equal(result[5].r, '1', 'result[5] is 1');
    });

    var optionsFull = Object.assign({}, alg.options);
    optionsFull.brief = false;

    alg.func(modexps, defaults, optionsFull).then(result => {
      t.equal(result[1].b, '2', 'result[1] has base 2');
      t.equal(result[2].e, '4', 'result[2] has exponent 4');
      t.equal(result[3].m, 'b', 'result[3] has modulus b');

      t.equal(result[0].r, '5', 'result[0] is 5');
      t.equal(result[1].r, '5', 'result[1] is 5');
      t.equal(result[2].r, '5', 'result[2] is 5');
      t.equal(result[3].r, '5', 'result[3] is 5');
      t.equal(result[4].r.toLowerCase(), 'a', 'result[4] is 5');
      t.equal(result[5].r, '1', 'result[5] is 1');
    });
  });
});
