var test = require('tape');
var FamodulusClient = require('../');

var fam = new FamodulusClient(['http://localhost:8081/api/modexp/'], ['http://localhost:8081/api/modexp/']);

test('direct', function (t) {
  t.plan(1);

  fam.direct('2', '4', 'b').then(result => {
    t.equal(result.r, '5');
  });
});
