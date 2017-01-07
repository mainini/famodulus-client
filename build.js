/*
 * Copyright 2016 Pascal Mainini
 * Licensed under MIT license, see included file LICENSE or
 * http://opensource.org/licenses/MIT
 */
/* global mkdir, exec */

require('shelljs/global');

mkdir('-p', '.build/js');
exec('browserify lib/client.js --standalone FamodulusClient -o .build/js/famodulus.browser.js');
exec('jsdoc -d .build/doc lib/*');
exec('istanbul cover --dir=.build/coverage test/client.js');
