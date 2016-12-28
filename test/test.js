var test = require('tape');
var famodulus = require('../');

test('direct', function (t) {
    t.plan(1);

    var f = new famodulus(['http://localhost:8081/api/modexp/']);
    f.direct('2','4','b').then(result => {
      t.equal(result.r, '5');
    });
});