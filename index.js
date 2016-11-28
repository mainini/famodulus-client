var famodulus = require('./src/famodulus-client.js');
var bigint = require('./src/bigint-wrapper.js');

if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = {
        'Famodulus':famodulus,
        'BigInt':bigint
    };
}

if (typeof window !== 'undefined') {
    window.BigInt = bigint;
    window.Famodulus = famodulus;
}