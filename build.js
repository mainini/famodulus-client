/* global mkdir, exec */

require('shelljs/global');

mkdir('-p', '.build');
exec('browserify lib/client.js --standalone FamodulusClient -o .build/famodulus.browser.js');
