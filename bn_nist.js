/* jscrypto library, big number, nist prime
 *   by GUAN Zhi <guanzhi at guanzhi dot org>
 */

var bn_nistp192 = bn_from_hex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF");

function bn_mod_nistp192_add(a, b) {
	var r = bn_add(a, b);
	if (bn_cmp(r, bn_nistp192) >= 0) {
		r = bn_sub(r, bn_nistp192);
	}
	return r;
}

function bn_192_cmp(a, b) {
	var t;
	t = a[12] - b[12]; if (t) return t;
	t = a[11] - b[11]; if (t) return t;
	t = a[10] - b[10]; if (t) return t;
	t = a[ 9] - b[ 9]; if (t) return t;
	t = a[ 8] - b[ 8]; if (t) return t;
	t = a[ 7] - b[ 7]; if (t) return t;
	t = a[ 6] - b[ 6]; if (t) return t;
	t = a[ 5] - b[ 5]; if (t) return t;
	t = a[ 4] - b[ 4]; if (t) return t;
	t = a[ 3] - b[ 3]; if (t) return t;
	t = a[ 2] - b[ 2]; if (t) return t;
	t = a[ 1] - b[ 1]; if (t) return t;
	return (a[0] - b[0]);
}

function bn_192_add(a, b) {
	var r = a.slice(0);
	var c = 0, t;
	t =  a[ 0] + b[ 0]; r[ 0] = t & 65535; t >>> 16;
	t += a[ 1] + b[ 1]; r[ 1] = t & 65535; t >>> 16;
	t += a[ 2] + b[ 2]; r[ 2] = t & 65535; t >>> 16;
	t += a[ 3] + b[ 3]; r[ 3] = t & 65535; t >>> 16;
	t += a[ 4] + b[ 4]; r[ 4] = t & 65535; t >>> 16;
	t += a[ 5] + b[ 5]; r[ 5] = t & 65535; t >>> 16;
	t += a[ 6] + b[ 6]; r[ 6] = t & 65535; t >>> 16;
	t += a[ 7] + b[ 7]; r[ 7] = t & 65535; t >>> 16;
	t += a[ 8] + b[ 8]; r[ 8] = t & 65535; t >>> 16;
	t += a[ 9] + b[ 9]; r[ 9] = t & 65535; t >>> 16;
	t += a[10] + b[10]; r[10] = t & 65535; t >>> 16;
	t += a[11] + b[11]; r[11] = t & 65535; t >>> 16;
	r[12] = t;
	return r;
}

function bn_192_add_(a, b) {
	var r = a.slice(0);
	var c = 0, t;
	t =  a[ 0] + b[ 0]; r[ 0] = t & 0xffffff; t >>> 24;
	t += a[ 1] + b[ 1]; r[ 1] = t & 0xffffff; t >>> 24;
	t += a[ 2] + b[ 2]; r[ 2] = t & 0xffffff; t >>> 24;
	t += a[ 3] + b[ 3]; r[ 3] = t & 0xffffff; t >>> 24;
	t += a[ 4] + b[ 4]; r[ 4] = t & 0xffffff; t >>> 24;
	t += a[ 5] + b[ 5]; r[ 5] = t & 0xffffff; t >>> 24;
	t += a[ 6] + b[ 6]; r[ 6] = t & 0xffffff; t >>> 24;
	t += a[ 7] + b[ 7]; r[ 7] = t & 0xffffff; t >>> 24;
	r[8] = t;
	return r;
}

function bn_192_mul(a, b) {
	/* i = 0 */
	c = 0;
	k = 0;
	j = 0;
	r = new Array();
	
	for (var i = 0; i < 12; i++) {
	uv = r[ 0] + a[ 0] * b[ 0] + c; r[ 0] = uv & 65535; c = uv >>> 16;
	uv = r[ 1] + a[ 0] * b[ 1] + c; r[ 1] = uv & 65535; c = uv >>> 16;
	uv = r[ 2] + a[ 0] * b[ 2] + c; r[ 2] = uv & 65535; c = uv >>> 16;
	uv = r[ 3] + a[ 0] * b[ 3] + c; r[ 3] = uv & 65535; c = uv >>> 16;
	uv = r[ 4] + a[ 0] * b[ 4] + c; r[ 4] = uv & 65535; c = uv >>> 16;
	uv = r[ 5] + a[ 0] * b[ 5] + c; r[ 5] = uv & 65535; c = uv >>> 16;
	uv = r[ 6] + a[ 0] * b[ 6] + c; r[ 6] = uv & 65535; c = uv >>> 16;
	uv = r[ 7] + a[ 0] * b[ 7] + c; r[ 7] = uv & 65535; c = uv >>> 16;
	uv = r[ 8] + a[ 0] * b[ 8] + c; r[ 8] = uv & 65535; c = uv >>> 16;
	uv = r[ 9] + a[ 0] * b[ 9] + c; r[ 9] = uv & 65535; c = uv >>> 16;
	uv = r[10] + a[ 0] * b[10] + c; r[10] = uv & 65535; c = uv >>> 16;
	uv = r[11] + a[ 0] * b[11] + c; r[11] = uv & 65535; c = uv >>> 16;
	}
	return r;
}

function bn_mul_float(a, b) {
	var a_len = a.length - 1;
	var b_len = b.length - 1;
	a_len = 6; b_len = 6;
	var r = bn_zero.slice(0, a_len + b_len + 1);
	var c, uv, k;
	for (var i = 0; i < a_len; i++) {
		c = 0;
		k = i;
		for (var j = 0; j < a_len; j++, k++) {
			uv = r[k] + a[i] * b[j] + c;
			r[k] = uv & 0xffffff;
			c = uv >>> 24;
		}
		r[i + b_len] = c;
	}
	return r;
}

function bn_mod_nistp192_sub(a, b) {
	return (bn_cmp(a, b) >= 0) ?  bn_sub(a, b) : 
		bn_add(a, bn_sub(bn_nistp192, b));
}

function bn_mod_nistp192(a) {
	var i;
	var s1 = a.slice(0, 13);
	var s2 = bn_zero.slice(0, 13);
	var s3 = s2.slice(0);
	var s4 = s2.slice(0);
	s1[12] = 0;
	for (i = 0; i < 4; i++) {
		s2[i] = s2[i + 4] = a[i + 12];
	}
	for (var i = 4; i < 8; i++) {
		s3[i] = s3[i + 4] = a[i + 12];
	}
	for (var i = 0; i < 4; i++) {
		s4[i] = s4[i + 4] = s4[i + 8] = a[i + 20];
	}
	var p = bn_nistp192;
	return bn_mod_add(bn_mod_add(bn_mod_add
		(s1, s2, p), s3, p), s4, p);
}

/*

s1 = c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, 0
s2 = c12,c13,c14,c15,c12,c13,c14,c15, 0,  0,   0,  0 , 0
s3 = 0,  0,  0,  0,  c16,c17,c18,c19,c16,c17,c18, c19,  0
s4 = c20,c21,c22,c23,c20,c21,c22,c23,c20,c21,c22, c23, 0

*/


function bn_mod_nistp192_(a) {
	var r = new Array(13);
	var c = 0;
	r[0] = a[0] + a[12] + a[20];
	c = r[0] % 65536;
	r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
	r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
	r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
		r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
		r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
		r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
	
			r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
		r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
		r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
		r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
		r[1] = a[0] + a[12] + a[20] + c;
	c = r[1] % 65536;
	
	return r;
	
}

function bn_mod_nistp192_mul(a, b) {
	var r = bn_mul(a, b);
	return bn_mod_nistp192(r);
}

function bn_mod_nistp192_sqr(a) {
	return bn_mod_nistp192(bn_sqr(a));
}

function bn_mod_nistp192_div2(a) {
	return bn_rshift1((a[0] & 1) ? bn_add(a, bn_nistp192) : a);
}



