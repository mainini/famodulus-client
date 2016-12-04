/*jshint node:true, eqeqeq:true, esversion:5, bitwise:true, curly:true, immed:true, indent:4, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:single, undef:true, unused:true, trailing:true, white:false, forin:true, futurehostile:true, nonbsp:true, nonew:true, strict:true */
/* globals verificatum */

function _modexpVerificatum(base, exponent, modulus)
{
    'use strict';
    var b = new verificatum.arithm.LargeInteger(base);
    var e = new verificatum.arithm.LargeInteger(exponent);
    var m = new verificatum.arithm.LargeInteger(modulus);

    return b.modPow(e,m).toHexString(16);
}

function _modexpLeemon(base, exponent, modulus) {
    'use strict';
    var _BigInt = require('BigInt');

    var b = _BigInt.str2bigInt(base,16,0);
    var e = _BigInt.str2bigInt(exponent,16,0);
    var m = _BigInt.str2bigInt(modulus,16,0);

    return _BigInt.bigInt2str(_BigInt.powMod(b,e,m),16);
}

if (typeof verificatum !== 'undefined') {
    console.log('Verificatum library detected!');
    module.exports = {
        'modexp':_modexpVerificatum
    };
} else {
    module.exports = {
        'modexp':_modexpLeemon
    };
}
