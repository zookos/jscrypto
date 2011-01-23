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

About This Document
-------------------

Everything above was hosted on the jscrypto home page (presumably it was written by Guan, Zhi). Zooko copied it and reformatted it into ReStructuredText. Everything below was written by Zooko.

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
text of the GNU General Public License, v2.

Questions About Distribution
----------------------------

* *Q:* You, Zooko, are not the author of this code. Why did you upload it to github?

  *A:* The source code was not in the *code.google.com* SVN repository; I had to copy it out of the web demo. Having copied the source code, I wanted to host it somewhere so that others could find it. Github makes this very easy (I already have an account on github, and creating a new repository there is quick and easy. Also I prefer to use *github* over *code.google.com* for this because:
   * github is very popular, so more people are likely to find code there, and
   * github uses git where code.google.com uses SVN; git is better than SVN for facilitating replication, variation, selection, and recombination.

* *Q:* Why is it licensed under the GPL here when it says LGPL (the Lesser GNU Public Licence) on the jscrypto home page?

  *A:* I don't have the right to redistribute jscrypto under the terms of the LGPL but I do have the right to redistribute it under the terms of the GPL. The same is true of the authors of jscrypto! This is because jscrypto is a derived work of *jsaes*, which was distributed under the terms of the GPL. This means that the authors of jscrypto (Guan, Zhi) didn't have the right to derive jscrypto from jsaes while distributing jscrypto under any terms other than the GPL. At the same time, Guan, Zhi intended to license jscrypto under the terms of the LGPL, and the LGPL allows the work to be relicensed under the GPL. Therefore I can redistribute jscrypto under the GPL while satisfying the licensing terms intended by both authors, and indeed that is the only licence I can use for that.

  I will write to both authors and ask if they are willing to let me redistribute jsaes and jscrypto under other Free Software/Open Source licences as well.

.. _WebIBC: http://webibc.appspot.com/
.. _COPYING.GPL2: COPYING.GPL2
.. _Guan, Zhi: http://infosec.pku.edu.cn/~guanzhi/
.. _Bertram Poettering: http://point-at-infinity.org/
