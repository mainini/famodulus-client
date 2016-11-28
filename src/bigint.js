if (typeof verificatum !== 'undefined') {
    console.log("Verificatum library detected!");
    module.exports = {
        'modexp':_modexpVerificatum
    };
} else {
    var _BigInt = require('BigInt');

    module.exports = {
        'modexp':_modexpLeemon
    };
}

function _modexpVerificatum(base, exponent, modulus)
{
    var b = new verificatum.arithm.LargeInteger(base);
    var e = new verificatum.arithm.LargeInteger(exponent);
    var m = new verificatum.arithm.LargeInteger(modulus);

    return b.modPow(e,m).toHexString(16)
}

function _modexpLeemon(base, exponent, modulus) {
    var b = _BigInt.str2bigInt(base,16,0);
    var e = _BigInt.str2bigInt(exponent,16,0);
    var m = _BigInt.str2bigInt(modulus,16,0);

    return _BigInt.bigInt2str(_BigInt.powMod(b,e,m),16);
}
