/* jscrypto library, ellitpic curve cryptography
 *   by GUAN Zhi <guanzhi at guanzhi dot org>
 */
 
/*

 json encoding of an ecpoint
	
	var ecpoint_json = '{
		"x":"188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012",
		"y":"07192b95ffc8da78631011ed6b24cdd573f977a11e794811",
		"z":"000000000000000000000000000000000000000000000001"
	}';
	
 json encoding of an ecpoint array

	var ecpoint_array_json = '[
		{"x":"3424234", "y":"29384729", "z":"20983284"},
		{"x":"3424234", "y":"29384729", "z":"20983284"},
		 ... ...
		{"x":"3424234", "y":"29384729", "z":"20983284"} 
	]';
   
*/


function ecpoint(x, y, z) {
	if (x == undefined || y == undefined) {
		this.is_infinity = true;
		return;
	}
	this.x = x.slice(0);
	this.y = y.slice(0);
	if (z == undefined) {
		this.z = bn_one.slice(0, x.length);
	} else {
		this.z = z.slice(0);
	}
	this.is_infinity = false;
}

function ecpoint_to_affine(A, ecparam) {
	var p = ecparam.p;
	var z_1 = bn_mod_invert(A.z, p);
	var z_2 = bn_mod_sqr(z_1, p);
	var z_3 = bn_mod_mul(z_1, z_2, p);
	return new ecpoint(bn_mod_mul(A.x, z_2, p), bn_mod_mul(A.y, z_3, p));
}

function ecpoint_get_affine_x(A, ecparam) {
	var z_1 = bn_mod_invert(A.z, ecparam.p);
	var z_2 = bn_mod_sqr(z_1, ecparam.p);
	return bn_mod_mul(A.x, z_2, ecparam.p);
}





function ecpoint_mul(k, P, ecparam) {
}

function ecpoint_mul_G(k, ecparam) {
	var bits = bn_to_bits(k);
	var i = bits.length;
	
	
	var kG = ecparam.kG;
	if (kG.length < bits) {
		ecparam_pre_compute(ecparam);
	}
	
	var R = new ecpoint(kG[i].x, kG[i].y, kG[i].z);
	while (--i >= 0) {
		if (bits[i] == '1')
			R = ecpoint_add(R, kG[i], nistp192);
	}
	return R;
}

function ecpoint_mul_G_nistp192(k) {
	var bits = bn_to_bits(k);
	var i = bits.length;
	var kG = nistp192.kG;
	var R = new ecpoint(kG[i].x, kG[i].y, kG[i].z);
	while (--i >= 0) {
		if (bits[i] == '1')
			R = ecpoint_add(R, kG[i], nistp192);
	}
	return R;
}

function ecdsa_sig(r, s) {
	this.r = r.slice(0);
	this.s = s.slice(0);
}

function ecdsa_sig_to_str(sig) {
	return '{"r":"0x'+bn_to_hex(sig.r)+'","s":"0x'+bn_to_hex(sig.s)+'"}';
}

function ecdsa_sig_from_str(str) {
	var sig = eval('(' + str + ')');
	sig.r = bn_from_hex(sig.r.substring(2));
	sig.s = bn_from_hex(sig.s.substring(2));
	return sig;
}

function ecdsa_pre_compute(ecparam) {
	var k, Q, r;
	var n = ecparam.n;
	do {
		do {
			k = bn_rand(n);
		} while (bn_is_zero(k));
		
		Q = ecpoint_mul_G(k, ecparam);
		r = ecpoint_get_affine_x(Q, ecparam);
		while (bn_cmp(r, n) >= 0) {
			r = bn_sub(r, n);
		}
	} while (bn_is_zero(r));
	
	return new Array(bn_mod_invert(k, n), r);
}

function ecdsa_pre_compute_nistp192(ecparam_nistp192) {
	var k, Q, r;
	var n = ecparam_nistp192.n;
	do {
		do {
			k = bn_pseudo_rand(n);
		} while (bn_is_zero(k));
		Q = ecpoint_mul_G_nistp192(k);
		r = ecpoint_get_x(ecparam_nistp192, Q);
		while (bn_cmp(r, ecparam_nistp192.n) >= 0)
			r = bn_sub(r, ecparam_nistp192.n);
	} while (bn_is_zero(r));
	var pre_compute = new Array();
	pre_compute.k_1 = bn_mod_invert(k, n);
	pre_compute.r = r;
	return pre_compute;
}

function ecdsa_sha1_sign(ecparam, digest, pri_key, k_1, r) {
	if (k_1 == null || r == null) {
		ecdsa_pre_compute(ecparam, k_1, r);
	}
	var d = pri_key;
	var n = ecparam.n;
	var e = bn_from_binb(core_sha1(message, str.length * chrsz));
	var s = bn_mod_mul(k_1, bn_mod_add(e, bn_mod_mul(d, r, n), n), n);
	return new ecdsa_sig(r, s);
}

function ecdsa_do_verify(ecparam, digest, signature, pub_key) {
	var r = sig.r;
	var s = sig.s;

	if (bnIsZero(r) || bnCmp(r, EC.n) >= 0 ||
	    bnIsZero(s) || bnCmp(s, EC.n) >= 0)
		return false;
	
	if (digest.length < bnNumBytes(EC.n))
		e = bnFromBin(digest);
	else	
		e = bnFromBin(digest);
	
	w = bnModInvert(s, EC.n);
	u = bnModMul(e, w, EC.n);
	v = bnModMul(r, w, EC.n);
	Q = ptMulAdd(u, EC.G, v, P);
	
	if (Q.isAtInfinity)
		return false;
		
	x = ptGetAffineX(EC, Q);
	
	while (bnCmp(x, EC.n) >= 0)
		x = bnSub(x, EC.n);
	
	if (bnCmp(x, r) == 0)
		return true;
	else
		return false;
}

function ecdh(ecparam, plaintext, pub_key) {
	var emphe_bn = bn_rand(ecparam.n);
	var emphe_pt = ecpoint_mul_G(ecparam, bn);
	var share_pt = ecpoint_mul(ecparam, emphe_bn, pub_key);
}

