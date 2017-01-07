/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */
'use strict';

const test = require('tape');
const Client = require('../lib/client.js');

const servers = ['http://localhost:8081/api/modexp/', 'http://localhost:8081/api/modexp/'];

/*
 * Test the constructor of FamodulusClient
 */
test('constructor', function (t) {
  t.plan(9);

  let c1 = Client('servers1');  // test non-constructor form as well
  t.equal(c1.servers, 'servers1', 'c1: servers set correctly');
  t.notOk(c1.checked, 'c1: checked default value');
  t.ok(c1.brief, 'c1: brief default value');

  let c2 = new Client('servers2', true);
  t.equal(c2.servers, 'servers2', 'c2: servers set correctly');
  t.ok(c2.checked, 'c2: checked set correctly');
  t.ok(c2.brief, 'c2: brief default value');

  let c3 = new Client('servers3', true, false);
  t.equal(c3.servers, 'servers3', 'c3: servers set correctly');
  t.ok(c3.checked, 'c3: checked set correctly');
  t.notOk(c3.brief, 'c3: brief set correctly');
});

/*
 * Test the direct function of FamodulusClient
 */
test('direct', function (t) {
  t.plan(40);

  let defaults = {b: '2', e: '4', m: 'b'};
  let modexps1 = [{b: '2', e: '4', m: 'b'}];
  let modexps2 = [{b: '2', e: '4', m: 'b'}, {e: '4', m: 'b'}, {b: '2', m: 'b'}, {m: 'b'}, {}];

  // test for unsupported checking
  let c1 = new Client(servers, true);
  t.throws(() => c1.direct(modexps1), /does not support checking/, 'checking unsupported');

  // test argument number checking
  let c2 = new Client(servers);
  t.throws(() => c2.direct(), /Missing modexps argument/, 'too little arguments');

  // direct(modexps)
  c2.direct(modexps1).then(result => {
    t.equal(result[0].r, '5', 'result default server is 5');
    t.equal(result[0].b, undefined, 'result has no base');
  });

  // direct(modexps, server)
  c2.direct(modexps1, 1).then(result => {
    t.equal(result[0].r, '5', 'result server 1 is 5');
    t.equal(result[0].b, undefined, 'result has no base');
  });

  // direct(modexps, defaults)
  c2.direct(modexps2, defaults).then(result => {
    t.equal(result[0].r, '5', 'result[0] default server is 5');
    t.equal(result[1].r, '5', 'result[1] default server is 5');
    t.equal(result[2].r, '5', 'result[2] default server is 5');
    t.equal(result[3].r, '5', 'result[3] default server is 5');
    t.equal(result[4].r, '5', 'result[4] default server is 5');
    t.equal(result[0].b, undefined, 'result[0] has no base');
    t.equal(result[1].b, undefined, 'result[1] has no base');
    t.equal(result[2].b, undefined, 'result[2] has no base');
    t.equal(result[3].e, undefined, 'result[3] has no exponent');
    t.equal(result[4].m, undefined, 'result[4] has no modulus');
  });

  // direct(modexps, defaults, server)
  c2.direct(modexps2, defaults, 1).then(result => {
    t.equal(result[0].r, '5', 'result[0] server 1 is 5');
    t.equal(result[1].r, '5', 'result[1] server 1 is 5');
    t.equal(result[2].r, '5', 'result[2] server 1 is 5');
    t.equal(result[3].r, '5', 'result[3] server 1 is 5');
    t.equal(result[4].r, '5', 'result[4] server 1 is 5');
    t.equal(result[0].b, undefined, 'result[0] has no base');
    t.equal(result[1].b, undefined, 'result[1] has no base');
    t.equal(result[2].b, undefined, 'result[2] has no base');
    t.equal(result[3].e, undefined, 'result[3] has no exponent');
    t.equal(result[4].m, undefined, 'result[4] has no modulus');
  });

  // test for full response
  let c3 = new Client(servers, false, false);
  c3.direct(modexps2, defaults).then(result => {
    t.equal(result[0].r, '5', 'result[0] default server is 5');
    t.equal(result[1].r, '5', 'result[1] default server is 5');
    t.equal(result[2].r, '5', 'result[2] default server is 5');
    t.equal(result[3].r, '5', 'result[3] default server is 5');
    t.equal(result[4].r, '5', 'result[4] default server is 5');
    t.equal(result[0].b, '2', 'result[0] has base 2');
    t.equal(result[1].b, undefined, 'result[1] has no base');
    t.equal(result[1].e, '4', 'result[1] has base 4');
    t.equal(result[2].e, undefined, 'result[2] has no exponent');
    t.equal(result[2].m, 'b', 'result[2] has modulus b');
    t.equal(result[3].m, 'b', 'result[3] has modulus b');
    t.equal(result[4].b, undefined, 'result[4] has no base');
    t.equal(result[4].e, undefined, 'result[4] has no exponent');
    t.equal(result[4].m, undefined, 'result[4] has no modulus');
  });
});

/*
 * Test the decExponent function of FamodulusClient
 */
test('decExponent', function (t) {
  t.plan(47);

  let defaults = {b: '2', e: '4', m: 'b'};
  let modexps1 = [{b: '2', e: '4', m: 'b'}];
  let modexps2 = [{b: '2', e: '4', m: 'b'}, {e: '4', m: 'b'}, {b: '2', m: 'b'}, {m: 'b'}, {}];

  // test argument number checking
  let c1 = new Client(servers);
  t.throws(() => c1.decExponent(), /Missing modexps argument/, 'too little arguments');

  // decExponent(modexps)
  c1.decExponent(modexps1).then(result => {
    t.equal(result[0].r, '5', 'result default server is 5');
    t.equal(result[0].b, undefined, 'result has no base');
  });

  // decExponent(modexps, checked)
  t.notOk(c1.checked, 'c1: checked default value');
  c1.decExponent(modexps1, true).then(result => {
    t.equal(result[0].r, '5', 'result server 1 is 5');
    t.equal(result[0].b, undefined, 'result has no base');
  });

  // decExponent(modexps, defaults)
  c1.decExponent(modexps2, defaults).then(result => {
    t.equal(result[0].r, '5', 'result[0] default server is 5');
    t.equal(result[1].r, '5', 'result[1] default server is 5');
    t.equal(result[2].r, '5', 'result[2] default server is 5');
    t.equal(result[3].r, '5', 'result[3] default server is 5');
    t.equal(result[4].r, '5', 'result[4] default server is 5');
    t.equal(result[0].b, undefined, 'result[0] has no base');
    t.equal(result[1].b, undefined, 'result[1] has no base');
    t.equal(result[2].b, undefined, 'result[2] has no base');
    t.equal(result[3].e, undefined, 'result[3] has no exponent');
    t.equal(result[4].m, undefined, 'result[4] has no modulus');
  });

  // decExponent(modexps, defaults, checked)
  t.notOk(c1.checked, 'c1: checked default value');
  c1.decExponent(modexps2, defaults, true).then(result => {
    t.equal(result[0].r, '5', 'result[0] server 1 is 5');
    t.equal(result[1].r, '5', 'result[1] server 1 is 5');
    t.equal(result[2].r, '5', 'result[2] server 1 is 5');
    t.equal(result[3].r, '5', 'result[3] server 1 is 5');
    t.equal(result[4].r, '5', 'result[4] server 1 is 5');
    t.equal(result[0].b, undefined, 'result[0] has no base');
    t.equal(result[1].b, undefined, 'result[1] has no base');
    t.equal(result[2].b, undefined, 'result[2] has no base');
    t.equal(result[3].e, undefined, 'result[3] has no exponent');
    t.equal(result[4].m, undefined, 'result[4] has no modulus');
  });

  // test for full response
  let c2 = new Client(servers, false, false);
  c2.decExponent(modexps2, defaults).then(result => {
    t.equal(result[0].r, '5', 'result[0] default server is 5');
    t.equal(result[1].r, '5', 'result[1] default server is 5');
    t.equal(result[2].r, '5', 'result[2] default server is 5');
    t.equal(result[3].r, '5', 'result[3] default server is 5');
    t.equal(result[4].r, '5', 'result[4] default server is 5');
    t.equal(result[0].b, '2', 'result[0] has base 2');
    t.equal(result[1].b, undefined, 'result[1] has no base');
    t.equal(result[1].e, '4', 'result[1] has base 4');
    t.equal(result[2].e, undefined, 'result[2] has no exponent');
    t.equal(result[2].m, 'b', 'result[2] has modulus b');
    t.equal(result[3].m, 'b', 'result[3] has modulus b');
    t.equal(result[4].b, undefined, 'result[4] has no base');
    t.equal(result[4].e, undefined, 'result[4] has no exponent');
    t.equal(result[4].m, undefined, 'result[4] has no modulus');
  });

  // decExponent(modexps), checked by default
  let c3 = new Client(servers, true);
  t.ok(c3.checked, 'c3: checked true');
  c3.decExponent(modexps1).then(result => {
    t.equal(result[0].r, '5', 'result server 1 is 5');
    t.equal(result[0].b, undefined, 'result has no base');
  });

  // decExponent(modexps), forced unchecked
  let c4 = new Client(servers, false);
  t.notOk(c4.checked, 'c4: checked false');
  c4.decExponent(modexps1).then(result => {
    t.equal(result[0].r, '5', 'result server 1 is 5');
    t.equal(result[0].b, undefined, 'result has no base');
  });
});
