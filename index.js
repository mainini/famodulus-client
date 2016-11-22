var bigInt = require("big-integer");

var Famodulus = (function (undefined) {
    "use strict";
})();

if (typeof window !== 'undefined') {
    window.bigInt = bigInt;
    window.Famodulus = Famodulus;
}

if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = Famodulus;
}