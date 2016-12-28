/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */
'use strict';

var test = require('tape');
var util = require('../lib/util.js');
var _I = require('BigInt');

test('request', function (t) {
  t.plan(1);
  util.request({modexps: [{b: '2', e: '4', m: 'b'}]}, 'http://localhost:8081/api/modexp/').then(result => {
    t.equal(result[0].r, '5', 'result is 5');
  });
});

test('constants', function (t) {
  t.plan(2);
  t.ok(_I.equals(util.ZERO, _I.str2bigInt('0', 16, 0)), 'ZERO = 0');
  t.ok(_I.equals(util.ONE, _I.str2bigInt('1', 16, 0)), 'ONE = 1');
});

test('random', function (t) {
  t.plan(1);
  var bound = _I.str2bigInt('2', 16, 0);
  t.ok(_I.greater(bound, util.random(bound)), 'random value is smaller than bound');
});

test('randomlist', function (t) {
  var elems = 10;
  t.plan(elems);
  var list = util.randomList(elems);
  for (var i = 0; i < list.length; i++) {
    t.ok(list.indexOf(i) >= 0, 'list contains element ' + i);
  }
});

test('shufflelist', function (t) {
  t.plan(9);

  var list = ['A', 'B', 'C'];
  var shuffle = [2, 0, 1];
  var result = util.shuffleList(list, shuffle);
  t.equal(result.indexOf('C'), 0, 'C is at 0');
  t.equal(result.indexOf('A'), 1, 'A is at 1');
  t.equal(result.indexOf('B'), 2, 'B is at 2');

  result = util.unshuffleList(result, shuffle);
  t.equal(result.indexOf('A'), 0, 'A is at 0');
  t.equal(result.indexOf('B'), 1, 'B is at 1');
  t.equal(result.indexOf('C'), 2, 'C is at 2');

  result = util.shuffleList(list);
  t.ok(result.indexOf('A') >= 0, 'list contains A');
  t.ok(result.indexOf('B') >= 0, 'list contains B');
  t.ok(result.indexOf('C') >= 0, 'list contains C');
});
