# Introduction

famodulus-client is a JavaScript library for outsourcing modular exponentiations (modexps) in multiplicative groups with prime modulus.
It is based on the research conducted in [Efficient and Secure Outsourcing of Modular Exponentiation](http://mainini.ch/data/efficient-secure-modular-exponentiation-outsourcing.pdf).
The implementation makes extensive usage of various [ES6](http://www.ecma-international.org/ecma-262/6.0/) features and can be used in
a reasonably current browser (tested with Firefox 50.1) or in [node.js](https://nodejs.org) (>=6.9.1).

Outsourcing is performed using a RESTful API with one or more servers (depending on the algorithm). Have a look at
[famodulus-server](https://github.com/mainini/famodulus-server) for a working implementation or have a look at the
[API description](https://github.com/mainini/famodulus-server/blob/master/api.md).

The current version of the library supports the following outsourcing algorithms:

* Direct outsourcing without any blinding
* Blinding of the exponent by using a simple, algebraic decomposition (2 servers required)

See also [mainini/famodulus](https://github.com/mainini/famodulus) for a complete modexp outsourcing system containing this library as
well as the server and a corresponding demonstrator application.

_**WARNING: This library is intended exclusively for research purposes and must not be used in any real applications with any security
requirements. You have been warned.**_

# Installation

To install the library and its dependencies for usage in node.js as well as for building it for the browser, an installation of
[node.js](https://nodejs.org) with version 6.9.1 or later is required. After building, the library can be used in the browser without any
further dependencies.

## Web Browser

The code of the library is organized as a CommonJS module which is automatically transformed into a single file for usage in the browser
during the installation process. To use the library, check out this repository (if you haven't already), then run the installation process:

    npm install

After installing all dependencies, the library as well as its documentation should have been generated in the `.build` directory.
The file `.build/js/famodulus.browser.js` contains everything needed and can be loaded directly into the browser.

## node.js

famodulus-client is currently not published on [npmjs.org](https://www.npmjs.com). To use the library in node.js, simply clone it
to the `node_modules` directory of your choice (application or global), then start to use it straight away (see below).

# Usage

Interaction with the library occurs through a FamodulusClient object which offers methods for all supported algorithms:

    var FamodulusClient = require('famodulus-client');
    var client = new FamodulusClient(['server_1', 'server_2']);
    ...
    client.decExponent(modexps)
    ...

Documentation of FamodulusClient and all related code can be found in `.build/doc/module-famodulus-client_client-FamodulusClient.html` after
installation. Good usage examples can be found in `test/client.js` or in the [famodulus-demo](https://github.com/mainini/famodulus-demo).

# Version History

## 1.1.0 (2017-02-02)

* Large performance improvement due to new BigInteger conversion functions
* Abstraction of BigInteger library in own module

## 1.0.1 (2017-01-14)

* Bugfix: randomList() - random value must be < 1
* Bugfix: non-prime modulus in unit test causing the test to fail sometimes
* Improvement: Better performance with mod() and simpler testing in random()
* Improvement: Not shuffling lists of size <= 1

## 1.0.0 (2017-01-11)

* Initial version
* Supporting direct outsourcing and basic exponent decomposition
