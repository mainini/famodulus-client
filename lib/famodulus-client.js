var famodulus = require('./Famodulus.js');
var bigint = require('./bigint.js');

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = {
        'Famodulus': famodulus,
        'BigInt': bigint
    };
}

if (typeof window !== 'undefined') {
    window.BigInt = bigint;
    window.Famodulus = famodulus;
}