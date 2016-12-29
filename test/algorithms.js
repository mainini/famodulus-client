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

/*
 * A mapping of algorithm functions to test and their reqired options, used
 * in the tests below
 */
var algorithms = [
  {func: direct.direct, options: {server: server1, brief: true}},
  {func: dec.decExponent, options: {servers: [server1, server2], brief: true}},
  {func: dec.decExponent, options: {servers: [server1, server2], checked: true, brief: true}}
];

/*
 * Test all algorithms with a single modexp
 */
test('single', function (t) {
  t.plan(12 * algorithms.length);

  algorithms.forEach(alg => {
    // due to asynchronous code, we need to copy the options
    var optionsBrief = Object.assign({}, alg.options);

    // simple modexp, no defaults
    var modexps = [{b: '2', e: '4', m: 'b'}];
    var defaults = {};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].r, '5', 'single modexp, no defaults, result is 5');
    });

    // base only modexp with defaults
    modexps = [{b: '2'}];
    defaults = {b: '3', e: '4', m: 'b'};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].r, '5', 'single modexp with base, result is 5');
    });

    // exponent only modexp with defaults
    modexps = [{e: '4'}];
    defaults = {b: '2', e: '5', m: 'b'};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].r, '5', 'single modexp with exponent, result is 5');
    });

    // modulus only modexp with defaults
    modexps = [{m: 'b'}];
    defaults = {b: '2', e: '4', m: 'c'};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].r, '5', 'single modexp with modulus, result is 5');
    });

    // empty modexp with defaults
    modexps = [{}];
    defaults = {b: '2', e: '4', m: 'b'};
    alg.func(modexps, defaults, optionsBrief).then(result => {
      t.equal(result[0].b, undefined, 'result has no base');
      t.equal(result[0].e, undefined, 'result has no exponent');
      t.equal(result[0].m, undefined, 'result has no modulus');
      t.equal(result[0].r, '5', 'defaults only, brief result, result is 5');
    });

    // due to asynchronous code, we need to copy the options
    var optionsFull = Object.assign({}, alg.options);
    optionsFull.brief = false;

    // test full response
    modexps = [{b: '2', e: '4', m: 'b'}];
    defaults = {};
    alg.func(modexps, defaults, optionsFull).then(result => {
      t.equal(result[0].b, '2', 'result has base 2');
      t.equal(result[0].e, '4', 'result has exponent 4');
      t.equal(result[0].m, 'b', 'result has modulus 2');
      t.equal(result[0].r, '5', 'no defaults, full result, result is 5');
    });
  });
});

/*
 * Test all algorithms with multiple single modexps
 */
test('multi', function (t) {
  t.plan(18 * algorithms.length);

  algorithms.forEach(alg => {
    // due to asynchronous code, we need to copy the options
    var optionsBrief = Object.assign({}, alg.options);

    // a set of modexps with various values present/missing
    var modexps = [
      {},
      {b: '2'},
      {e: '4'},
      {m: 'b'},
      {b: '2', e: '5'},
      {b: '3', e: '5', m: 'b'}
    ];
    var defaults = {b: '2', e: '4', m: 'b'};

    // execute modexps with brief result
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

    // due to asynchronous code, we need to copy the options
    var optionsFull = Object.assign({}, alg.options);
    optionsFull.brief = false;

    // execute modexps with full result
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
