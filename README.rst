jscrypto
========

This library is an object oriented cryptography library that implements several fundamental cryptographic algorithms including AES, SHA-1, HMAC, BASE64, RSA, ECC and IBE for JavaScript. This library works in ActionScript as well.

A demo application based on jscrypto is available at `WebIBC`_.

Features
--------
* Performance heavily enhanced.
* Object oriented architecture, with a single namespace, and you can extend the framework with your own algorithms.
* Support Init, Upate, Final pattern for bulk data processing for most algorithms.
* Parallellized computing, even long term operation will not block the browser.
* Support a key storage interface, with multiple implementations.
* Support local file system access, users can upload a local file into the browser DOM tree and then processed with jscrypto algorithms.

Supported Cryptography Algorithms
---------------------------------
* Symmetric encryption: AES, DES, 3DES,
* Encryption mode: ECB, CBC, CTR,
* Digest algorithm: SHA-1, SHA256,
* Message Authentication Code (MAC): HMAC, CBCMAC, CMAC
* Random number generator (RNG): FIPS186, X9.17,
* Public key cryptography: RSA, DSA, ECC, CPK, IBE

Example
-------

::

 var cipher = jscrypto.aes;
 var key = 'password';
 var iv = 'initialvector';
 var encryptor = new jscrypto.cbcmode.encryptor(cipher, key, iv);
 var ctext = new Array();
 
 ctext.concat(encryptor.update('hello'));
 ctext.concat(encryptor.update('world'));
 ctext.concat(encryptor.final());
 
 document.write(ctext);

Home Page
---------

http://code.google.com/p/jscryptolib/

Authors
-------

* jscrypto: `Guan, Zhi`_
* jsaes: `Bertram Poettering`_

Licence
-------

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or (at
your option) any later version. See the file `COPYING.GPL2`_ for the
text of the GNU General Public License, v2.  `

.. _WebIBC: http://webibc.appspot.com/
.. _COPYING.GPL2: COPYING.GPL2
.. _Guan, Zhi: http://infosec.pku.edu.cn/~guanzhi/
.. _Bertram Poettering: http://point-at-infinity.org/
