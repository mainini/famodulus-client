/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */

/* global Promise */
'use strict';

/**
 * Mock method for global fetch, performs local calculations and allows for
 * manipulations of results to be able to test error cases in the unit tests.
 *
 * @param {String} uri          URI for the request, used here for distinguishing servers
 * @param {Object} data         Request data (body)
 * @returns {Promise}           With a json() function returning the actual content
 */
function fetchMock (uri, data) {
  let body = JSON.parse(data.body);
  let results = [];

  for (let modexp of body.modexps) {
    let b = Number.parseInt(modexp.b || body.b, 16);
    let e = Number.parseInt(modexp.e || body.e, 16);
    let m = Number.parseInt(modexp.m || body.m, 16);
    let r = Math.pow(b, e) % m;

    if (b === 0xfd && uri === 'server_2') continue;   // test for inequal amount of results
    if (b === 0xfe) r--;  // should not be detected by checking
    if (b === 0xff && uri === 'server_2') r--;  // let checking fail

    if (body.brief) results.push({r: r.toString(16)});
    else results.push({b: modexp.b, e: modexp.e, m: modexp.m, r: r.toString(16)});
  }

  return Promise.resolve({json: () => ({modexps: results})});
}

/* eslint-disable */
fetch = fetchMock;
