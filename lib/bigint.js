function _rand(length) {    // @todo use CSPRNG!
    'use strict';
    var retval = '';
    while (retval.length < length) {
        var value = Math.floor(Math.random() * 256);
        retval += value < 10 ? '0' + value.toString(16) : value.toString(16);
    }
    return retval;
}

function _modexpVerificatum(base, exponent, modulus) {
    'use strict';
    var b = new verificatum.arithm.LargeInteger(base);
    var e = new verificatum.arithm.LargeInteger(exponent);
    var m = new verificatum.arithm.LargeInteger(modulus);

    return b.modPow(e, m).toHexString(16);
}

function _modexpLeemon(base, exponent, modulus) {
    'use strict';
    var _BigInt = require('BigInt');

    var b = _BigInt.str2bigInt(base, 16, 0);
    var e = _BigInt.str2bigInt(exponent, 16, 0);
    var m = _BigInt.str2bigInt(modulus, 16, 0);

    return _BigInt.bigInt2str(_BigInt.powMod(b, e, m), 16);
}

function _subLeemon(x, y, mod) {
    'use strict';
    var _BigInt = require('BigInt');

    var bx = _BigInt.str2bigInt(x, 16, 0);
    var by = _BigInt.str2bigInt(y, 16, 0);

    if (typeof mod !== 'undefined') {
        var bmod = _BigInt.str2bigInt(mod, 16, 0);
        return _BigInt.bigInt2str(_BigInt.mod(_BigInt.sub(bx, by), bmod), 16);
    } else {
        return _BigInt.bigInt2str(_BigInt.sub(bx, by), 16);
    }
}

function _mulLeemon(x, y, mod) {
    'use strict';
    var _BigInt = require('BigInt');

    var bx = _BigInt.str2bigInt(x, 16, 0);
    var by = _BigInt.str2bigInt(y, 16, 0);

    if (typeof mod !== 'undefined') {
        var bmod = _BigInt.str2bigInt(mod, 16, 0);
        return _BigInt.bigInt2str(_BigInt.multMod(bx, by, bmod), 16);
    } else {
        return _BigInt.bigInt2str(_BigInt.mult(bx, by), 16);
    }
}

if (typeof verificatum !== 'undefined') {
    console.log('Verificatum library detected!');
    module.exports = {
        'rand': _rand,
        'modexp': _modexpVerificatum,
        'modexpLeemon': _modexpLeemon,
        'modexpVerificatum': _modexpVerificatum,
        'sub': _subLeemon,
        'subLeemon': _subLeemon,
        'mul': _mulLeemon,
        'mulLeemon': _mulLeemon
    };
} else {
    module.exports = {
        'rand': _rand,
        'modexp': _modexpLeemon,
        'modexpLeemon': _modexpLeemon,
        'modexpVerificatum': _modexpVerificatum,
        'sub': _subLeemon,
        'subLeemon': _subLeemon,
        'mul': _mulLeemon,
        'mulLeemon': _mulLeemon
    };
}
