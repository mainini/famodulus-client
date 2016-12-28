/* global mkdir, exec */

require('shelljs/global');

mkdir('-p', '.build/js');
exec('browserify lib/client.js --standalone FamodulusClient -o .build/js/famodulus.browser.js');
