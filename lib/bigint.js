var _BigInt = require('BigInt');

function _randString(bitLength) {    // @todo use CSPRNG!
    'use strict';
    var numNibbles = 2 * Math.floor(bitLength / 8) === 0 ? 1 : 2 * Math.floor(bitLength / 8);
    var retval = '';
    while (retval.length < numNibbles) {
        retval += Math.floor(Math.random() * 16).toString(16);
    }
    return retval;
}

function _randBigIntLeemon(bitLength) {
    'use strict';
    return _BigInt.str2bigInt(_randString(bitLength));
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
    var b = _BigInt.str2bigInt(base, 16, 0);
    var e = _BigInt.str2bigInt(exponent, 16, 0);
    var m = _BigInt.str2bigInt(modulus, 16, 0);

    return _BigInt.bigInt2str(_BigInt.powMod(b, e, m), 16);
}

function _subLeemon(x, y, mod) {
    'use strict';
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
    var bx = _BigInt.str2bigInt(x, 16, 0);
    var by = _BigInt.str2bigInt(y, 16, 0);

    if (typeof mod !== 'undefined') {
        var bmod = _BigInt.str2bigInt(mod, 16, 0);
        return _BigInt.bigInt2str(_BigInt.multMod(bx, by, bmod), 16);
    } else {
        return _BigInt.bigInt2str(_BigInt.mult(bx, by), 16);
    }
}

function _greater(x,y) {
    'use strict';
    return _BigInt.greater(x,y);
}

function _equals(x,y) {
    'use strict';
    return _BigInt.equals(x,y);
}

function _bitSizeLeemon(x) {
    'use strict';
    return _BigInt.bitSize(x);
}

// @todo create wrappers for the other functions using verificatum
if (typeof verificatum !== 'undefined') {
    console.log('Verificatum library detected!');
    module.exports = {
        'randString': _randString,
        'randBigInt': _randBigIntLeemon,
        'modexp': _modexpVerificatum,
        'modexpLeemon': _modexpLeemon,
        'modexpVerificatum': _modexpVerificatum,
        'sub': _subLeemon,
        'mul': _mulLeemon,
        'greater': _greater,
        'equals': _equals,
        'bitSize': _bitSizeLeemon
    };
} else {
    module.exports = {
        'randString': _randString,
        'randBigInt': _randBigIntLeemon,
        'modexp': _modexpLeemon,
        'modexpLeemon': _modexpLeemon,
        'modexpVerificatum': _modexpVerificatum,
        'sub': _subLeemon,
        'mul': _mulLeemon,
        'greater': _greater,
        'equals': _equals,
        'bitSize': _bitSizeLeemon
    };
}