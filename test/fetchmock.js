/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */
'use strict';

function fetchMock(uri, data) {
  let body = JSON.parse(data.body);

  console.log("brief: " + body.brief);
  console.log("modexps: " + JSON.stringify(body.modexps));

  return origFetch(uri, data);
};

let origFetch = fetch;
fetch = fetchMock;