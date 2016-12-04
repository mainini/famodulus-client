/*jshint node:true, eqeqeq:true, esversion:5, bitwise:true, curly:true, immed:true, indent:4, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:single, undef:true, unused:true, trailing:true, white:false, forin:true, futurehostile:true, nonbsp:true, nonew:true, strict:true */
/* globals window */

var famodulus = require('./src/Famodulus.js');
var bigint = require('./src/bigint.js');

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