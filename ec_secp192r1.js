﻿/* jscrypto library, ellitpic curve cryptography
 *   by GUAN Zhi <guanzhi at guanzhi dot org>
 */

var secp192r1_curve_name = "secp192r1";
var secp192r1_p = bn_nistp192;
var secp192r1_a = bn_from_hex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC");
var secp192r1_b = bn_from_hex("64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1");
var secp192r1_n = bn_from_hex("FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831");
var secp192r1_x = bn_from_hex("188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012");
var secp192r1_y = bn_from_hex("07192b95ffc8da78631011ed6b24cdd573f977a11e794811");
var secp192r1_h = 1;

function secp192r1_to_affine(A) {
	var z_1 = bn_mod_invert(A.z, secp192r1_p);
	var z_2 = bn_mod_nistp192_sqr(z_1);
	var z_3 = bn_mod_nistp192_mul(z_1, z_2);
	return new ecpoint(
		bn_mod_nistp192_mul(A.x, z_2),
		bn_mod_nistp192_mul(A.y, z_3));
}

function secp192r1_is_on_curve(A) {
	if (!bn_is_one(A.z))
		A = secp192r1_to_affine(A);
	var t0, t1, t2;
	t0 = bn_mod_nistp192_sqr(A.y);	
	t1 = bn_mod_nistp192_sqr(A.x);
	t1 = bn_mod_nistp192_mul(t1, A.x);
	t2 = bn_mod_nistp192_mul(A.x, secp192r1_a);
	t1 = bn_mod_nistp192_add(t1, t2);
	t1 = bn_mod_nistp192_add(t1, secp192r1_b);
	return bn_cmp(t0, t1) == 0;
}

function secp192r1_double(A) {
	var x1 = A.x, y1 = A.y, z1 = A.z;
	var t1, t2, t3;
	var x3, y3, z3;
	t1 = bn_mod_nistp192_sqr(z1);
	t2 = bn_mod_nistp192_sub(x1, t1);
	t1 = bn_mod_nistp192_add(x1, t1);
	t2 = bn_mod_nistp192_mul(t2, t1);
	t2 = bn_mod_nistp192_add(bn_mod_nistp192_add(t2, t2), t2);
	y3 = bn_mod_nistp192_add(y1, y1);
	z3 = bn_mod_nistp192_mul(y3, z1);
	y3 = bn_mod_nistp192_sqr(y3);
	t3 = bn_mod_nistp192_mul(y3, x1);
	y3 = bn_mod_nistp192_sqr(y3);
	y3 = bn_mod_nistp192_div2(y3);
	x3 = bn_mod_nistp192_sqr(t2);
	t1 = bn_mod_nistp192_add(t3, t3);
	x3 = bn_mod_nistp192_sub(x3, t1);
	t1 = bn_mod_nistp192_sub(t3, x3);
	t1 = bn_mod_nistp192_mul(t1, t2);
	y3 = bn_mod_nistp192_sub(t1, y3);
	return new ecpoint(x3, y3, z3);
}

function secp192r1_add_affine(A, x2, y2) {
	if (A.is_infinity == true)
		return new ecpoint(x2, y2, bn_one.slice(0, 13));
	var x1 = A.x, y1 = A.y, z1 = A.z;
	var t1, t2, t3, t4;
	var x3, y3, z3;
	
	t1 = bn_mod_nistp192_sqr(z1);
	t2 = bn_mod_nistp192_mul(t1, z1);
	t1 = bn_mod_nistp192_mul(t1, x2);
	t2 = bn_mod_nistp192_mul(t2, y2);
	t1 = bn_mod_nistp192_sub(t1, x1);
	t2 = bn_mod_nistp192_sub(t2, y1);
	if (bn_is_zero(t1)) {
		return bn_is_zero(t2) ? 
			secp192r1_double(new ecpoint(x2, y2, bn_one.slice(0, 13))) : 
			new ecpoint();
	}
	z3 = bn_mod_nistp192_mul(z1, t1);
	t3 = bn_mod_nistp192_sqr(t1);
	t4 = bn_mod_nistp192_mul(t3, t1);
	t3 = bn_mod_nistp192_mul(t3, x1);
	t1 = bn_mod_nistp192_add(t3, t3);
	x3 = bn_mod_nistp192_sqr(t2);
	x3 = bn_mod_nistp192_sub(x3, t1);
	x3 = bn_mod_nistp192_sub(x3, t4);
	t3 = bn_mod_nistp192_sub(t3, x3);
	t3 = bn_mod_nistp192_mul(t3, t2);
	t4 = bn_mod_nistp192_mul(t4, y1);
	y3 = bn_mod_nistp192_sub(t3, t4);
	return new ecpoint(x3, y3, z3);
}

function secp192r1_mul(k, P) {
	var bits = bn_to_bits(k);
	var R = ecpoint_new();
	var Q = ecpoint_dup(P);
	for (var i = bits.length - 1; i >= 0; i--) {
		if (bits[i] == 1) {
			R = secp192r1_add_affine(R, Q.x, Q.y);
		}
		Q = secp192r1_double(Q);
		secp192r1_to_affine(Q);
	}
	return R;
}

function secp192r1_mul_G(k) {
	var R = new ecpoint();
	var bits = bn_to_le_bits(k);
	for (var i = 0; i < 192; i++) {
		if (bits[i] == '1') {
			R = secp192r1_add_affine(R, 
			bn_from_hex(secp192r1_kG[i].slice(0, 48)), 
			bn_from_hex(secp192r1_kG[i].slice(48,96)));
		}
	}
	return R;
}



function secp192r1_ecdsa_pre_compute() {
	var k, Q;
	do {
		do {
			k = bn_pseudo_rand(secp192r1_n);
		} while (bn_is_zero(k));
		
		Q = secp192r1_mul_G(k);
		secp192r1_to_affine(Q);		
		while (bn_cmp(Q.x, n) >= 0) {
			Q.x = bn_sub(Q.x, n);
		}
		
	} while (bn_is_zero(Q.x));
	
	return {"k_1": bn_mod_invert(k, secp192r1_n), "r":Q.x};
}

function secp192r1_ecdsa_sign(digest, pri_key, k_1, r) {

	if (k_1 == null || r == null) {
		var pc = secp192r1_ecdsa_pre_compute();
		k_1 = pc.k_1;
		r = pc.r;
	}
	
	var d = pri_key;
	var n = secp192r1.n;
	var e = bn_from_bytes(digest);
	
	var s;
	s = bn_div(bn_mul(d, r), secp192r1_n)[1];
	s = bn_mod_add(e, s, secp192r1_n);
	s = bn_div(bn_mul(k_1, s), secp192r1_n)[1];

	return {"r":r, "s":s};
}

function secp192r1_ecdsa_verify(digest, sig, pub_key) {
	var r = sig.r;
	var s = sig.s;

	var e = bn_from_bytes(digest);
	
	w = bn_mod_invert(s, n);
	u = bn_mod_barrett_mul(e, w, secp192r1.barrett);
	v = bn_mod_barrett_mul(r, w, secp192r1.barrett);
	Q = secp192r1_mul_add(u, G, v, P);
	
	
	x = secp192r1_get_affine_x(Q);
	while (bn_cmp(x, secp192r1.n) >= 0) {
		x = bn_sub(x, n);
	}
	
	return (bn_cmp(x, r) == 0);
}


/*
 * the secp192r1_kG is generated by the C program with openssl
 *

#include <openssl/ec.h>
#include <openssl/objects.h>
#include <stdio.h>

int main()
{
	int i = 0;
	BN_CTX *bn_ctx = BN_CTX_new();
	const EC_GROUP *ec_group = EC_GROUP_new_by_curve_name(NID_X9_62_prime192v1);
	EC_POINT *Q = EC_POINT_dup(EC_GROUP_get0_generator(ec_group), ec_group);	
	do {
		printf("\"%s\",\n", EC_POINT_point2hex(ec_group, Q, 4, bn_ctx) + 2);
		EC_POINT_dbl(ec_group, Q, Q, bn_ctx);
	} while (i++ < 191);	
	return 0;
}


 */
var secp192r1_kG = [
"188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF101207192B95FFC8DA78631011ED6B24CDD573F977A11E794811",
"DAFEBF5828783F2AD35534631588A3F629A70FB16982A888DD6BDA0D993DA0FA46B27BBC141B868F59331AFA5C7E93AB",
"35433907297CC378B0015703374729D7A4FE46647084E4BAA2649984F2135C301EA3ACB0776CD4F125389B311DB3BE32",
"2FA1F92D1ECCE92014771993CC14899D4B5977883397EDDEA338AFDEF78B7214273B8B5978EF733FF2DD8A8E9738F6C0",
"B7310B4548FBFDBD29005092A5355BFCD99473733048AFDFFF9EAE9EDCD27C1E42D8585C4546D9491845C56629CF2290",
"C5A5972D9C055918B48023EA50E5AD979FB98448420880A26038FB784A780F5396CE0EDB96CFA1B8B320F86384188C55",
"E73B3792BFC59E8D09827DE8BA1B61AEB4A39F7EB97FA4345CCC1DF588A0F8F9F28B2B5DD7EFB0D8EC1A76CFAE20FB95",
"ACED16C30FE2DCCCF8BFF138D87CF00BEFC377F2A3F770D0C07FDF90AB9BE9881CA4CCCB42DB1EED9CBB7122CAFF09F1",
"9FF5229D3B61EDD21FA5302B22355286D812EFFF0DCB2EAAA8A8B331E844B4D16E8BD096D13B7B8CFFDFCCFC026164F6",
"319B54BF674E0C57538BCCB5DF6E8F6250AD0F1B5C04B276F73E1F13CDD6912FD41A42CBDB2DA3617EAD6781DCC394AA",
"BA24EE6052819109A387348D114B0DA9514623145C9AE29F08ED5F359918498A62B4DDAF52E9B2707773081F07DA2E76",
"78C2C6FDDCE72683FA0720ABC68ADE81FF4D11F8668593F1D4A79AE5A49793BE918897B80AA3638D9E24421C55FA0969",
"EE355E9C6A392603FAD7710DE187C91AF1C803E9CE1D0DB64F71B1C6A0299F7B862F7135E93FBF85B1FA412321D2CFDA",
"65A227C5877B02F953A0A39F19492F60AD8D55491B64893B058B0B001D301D23D9AB8FDAA5B536AF4397BE70EA781017",
"40F41C5E37E3224418C5CB3E06550ACF363EF54571892F0228A8B5ECDFC45AB939A312BE903C0D84E6293B415E45FA71",
"814CD305431A62FC95646970F0626EEFD8B2D9D915B0F1AFEF22EFAEBC94691D665781A6D16CFF052EFD43F88B35DB84",
"7D23ED578C0B10CD2CBA22F71FA93AE2A6AC7B9F131406AD8B8311DCBCA5DF183E989364EC8BEC0D262A3B0BF2525D64",
"D1B67325E76E186452EDAC84E9C519BC0613B9A38C69CBDFE86D14F4521628545986DD64B5858DD8B479163E1910EA26",
"52FBE4131E101D514E02A647C694B9035F40C00030FEDD08A70DAE1C4D387E8A5676AF1FCEF6D4D95D36CBD0511BE925",
"B6BB074BE06F99D0EDB2763A3DE9664355AA9AE07E8D5397E57A7163FB166944E3E8FCF9393C60CA8457C376CC7FED97",
"C7580802AFFEE06347789236A3E36A89BF6CD8B820AC893B1B14A0068C3173751BF320F4A122527AEFAF2D9EC1857578",
"5F1817849F76834719354E483D80FF0DF57DEF4C24451FED69E265E2B49DEA91B7F05DEA343993FF09EE782A27397C84",
"E8F9D4479F6457AE3AFCC0DED2DD9E4D0FF5D26504327AF0B576C4DF832B9DE3FE281C03CA8C19011ABCC91F4F79077C",
"7D0516AE644F282D519B20933D5B5848646F2EF33128C0AC0BCB5DB2D7ACE67B46304EDBE360962BF212494D254E16C3",
"09B95F940BD263B56B80EC5B18B038FDF60BD792CA7320377D80D527355ED561FBC3C982043F87F319EC93700AEC1ACD",
"C657D599A0AF929699C6928860B4F22443E29DEE44BB5883460DAB0F42F42E758BDB577B9A4B323D983289F2C1C7B573",
"2C4A0CD42E6EE16DD086D495C2062026A41A01739C0D66F20DE74846DB066C47E47EC48CF75B4BF7F6E21DA70558E4CE",
"3A66AB8275FCA7D3247A2995DFE7F4FCEAF32B10615F9C89D8706F25A14EC075CC0CDC15FF045D1A343D7839926C5AF7",
"F1998A3514CC1C3D65574A0C1A5368439683B9E044093861C69A45F531B044B145A6B4E991337355AE654068D06C577A",
"4C840E5CF2BB46ACB984A4D2EA87ACAC230FC2C3A2ADB4260D711806D550D0234D060923A149D343F1740AD28EFEC962",
"42A4045368AFB70A1850AF73B61A879A876AAB4A5AC40309579581DF94904546A1BA081658AE3B27F02705120DAB5744",
"F4A96CE31D598B4ADC1629254955E4A26FA8870044AA66A10B7EC075C776A5C406CF66D29C854FF9527389A9FA6E10E2",
"E9D5836399175374AA4E5B313C134D75DECA499084CE428F2F288D46327702C84A2EAEE14CFBB12F875AE41FDE99F1F0",
"72CD2A800968795C59A32FD9F02FD6B060DA8452B571AA755032CBCC80BF3898D03582DE89A07AAEDE93A63D16F6F0AC",
"FC8EF8111F98AA0341CD1CE38E53C43067DC3DE8CF6862EBFAFCA79A7444F9A7DBDCD7CB296152AB0805C9104EAFBE3E",
"9E5E09CF69CCEB775FC8790286A7FA697A173DB8A9B9CAF77BE1D8256DE3196A81788B4FA1B0BAF23AC99E715E11DC4E",
"D9B3E2F526164ABFE4146387A90BD1BA782134C349D986BE3E7AE645D5DD0D07F9B74F7D79639FE47BE54FB9C8D1D414",
"A7A7A99A3AC69AE53B1D6C9C0DED601CAF08673BD4E149ED520927C20BC6F676CE10B3D72FEE1295503ADFA75C6E9246",
"B870D62D5671D7C94B592E5A1B692374FE19940CBF06E0BE19F5547F50852D2C35E14993EE290C0C5C9B50F8A79EF27F",
"D729224C94CDB05C4F6FCB52DB8B22EF00DF16496E30B1AF0D32A2A268808AF934B1703AFF4A3FC1F3871E31546151CA",
"4191FB96F78A7F0796A582BA042CB2E2C7881E3B0D9979A9EE884D47CCC4C67F94E8B959030EBD69F53068754BEDA193",
"C9144151E671E2E9EA6921D8D2C284AB02B4AEEE0ECAAA0DEA6066D39856A228D98FA421375D5034D1C47B461727E17C",
"1920A4DF0F402C03C1807F71063C12ED6759D191FA3B41F037DF506AB873ECF6A3FB9E2EDA869C53F9F7D2EC1F571F2D",
"CC99E6476BE141969FC1C1D997FD281AB947A1BB2C8F0B4F3977AA4ED0CDB89343E69772FB53086F665B2AE4F335D7AA",
"CF81DEF62A358EDA1B716C5B74E7F4B6E5DA35A0BA5D1B22C720AF12BDFB598DD97BF620F3B9CBD2BAC71B3DBA572D36",
"33EA57CB2E84057AF83515D5B4684B3B6CA2E20D9F0F4410A15D3A0ACB0BF7C50DB72C53FCB2FD66F558C87AA5276F35",
"ED68FC779960F89F7967D3B9914191D3CE0F39EA9F29990E0187AEEB483501671BF6794E51ECF20B5A8512BC278A8105",
"205759C95E280A9ED7B36007627CAD09027AB959CD36A12BC5C1C42DAAE3D4502E82D1CAE95D96061F442BDD44FDDC5A",
"67E30CBDCBA671FBEB2CDFAE5A927C35C39649C55D7C48D8A93549C45810F5C3CE32D03C063015777A83CEE1ECBFBE7D",
"2B6CACB0C600C45CB37D3FCE1C31929AF7451A7257B5F01DE065AFCC4DF109DD294C91BF1450564308242B4547A577B6",
"C22C1BA321CE04740C0FAFE508D1BD3349BAE9D2491151E449F33C3BA43BB2C33A93332D9A61C88104EC6CB35CE56672",
"C37599B97759D317D37C29EA4A9D51A48FA03D35587135ED4D2D0CC97BF62F9BC5535AD409AF5CF3ECF60B48B42F8489",
"7FE01AA66FDD31BD0D024D62BAB866B5CFAEA451CA59BD506217317F42523CF4E4AEAA59CAF3195E5FFBF3D8F51B2DA1",
"EBF2BA007ACC905C38CF94B094B4F11649514C06C03AD7D9F3E0CBE190AE1501DCAE9F7CD38EA7A232D7B248BB8F859D",
"0C342F52391DF1F71C9A560475C58E004AAD01F6A71F98053810771B128D0244EFFB6BD3720A70B5E998815B4D730078",
"C6E8DFAB291105952C35C3967D071FB84FAF8D16ACCFC17971698F4B5FFACCAA9073EAD12B61657E3DB672894E201B7E",
"6E02E109FE3784C4E51A10DB74101902FE75C0EA0E32B059CB80564276D18A2987913C975A0B4169AD73921C9EB4B13B",
"9549CA0C79FC44496C8D4B39423B6B22628C04624A9463A6C8795C7B886A5F0EAA3A136482EF7F0FC98E22EEF6C86187",
"78312BCEC4FEE0B7AB76087933772D27190796FF2DDA9BD55B7916B0D3E8112DBB3215550AA585C3C345EF68EDF17418",
"7816616FAB1F09C5BE26ADAFC782178A5347BC5BA655C36527CFAD79E0C2781094D5C4BE6DCCA4D08DF3B4F8EBA0796B",
"F994D7CB00673AD2DDDF4FD3DBA105B87EBBDEBD4228C31B0212E05246800C662C4BAE88044815A88336B43E282EFF65",
"C3CD6E74F8097A51284E737C2379966ADFE611D31F646D848553F062E8876E7E1A97A130EB9577C838758660C82EE6CD",
"EDDF82259D0A40341A075402393AC154DDB71CD99D233C50F91D1811154953AA896B4DE185D8B3BDE4BDCB1A4669424B",
"1F60284E9BE9A61F933C526E15D99F9956D325506A3F653C267F5804F19712717AB1DA3A4D0681376B3291CDE9E6EC71",
"5E542B93EDB5D6E91E7A93B53AE1E678BAE1BF020388E2D9F9EBB891EEEC6409346479926C2B0A126D3239F4BF1C2B2B",
"54F8B7F059F7FD600D0DE608D981966C029C0654EF79BC7294927A689229086F274EBD8AB570FA8D21164428FACCA1F6",
"D0B43280B1218024E2248348981B9FFDC5282F156963A2DA1D73193872D24553C1F7AC339AB00AA40EE6417E41031F4F",
"4F2581091D7378AF11558B5B213A102B53840CC8231935EC52387E2DBA59071B0B6510F50AC140DEAE017AB8A8BF3B75",
"73CADCA6BE975F8A92E85F81953A4C5B74930470A386A9C608D99BCAC671B9879CEF856C2320739D008240A9EEC70948",
"DB4DAF19FA965E21B0CEF52038DB569517E4CEE4013010DA7EC9D95463FF3934257F4493160D03D30489BA87EE625F7E",
"898EF4A1756502023646BAFE2009C502EF7F1B6BBB3629964A0A158BA74C525465794634B0B7EF6AFC888B99945F30A1",
"0AA38ED480AA3074B916B12E26AA0B60760805CDD0920EC8BDA447FAB8213C1417A778FCA094EA2FA8B49AC2C68B7610",
"BD12EBD12AE54D508BEE2C1D00914A56E9A045F1B2B87BE3AC2BD78D9E7D57B3ECC58FAFE7CE8F40B283A79315349181",
"E49AA20224FD6B114FFE7680D5B5C0CC6EBD7E46F5566C979F28C9EECEE9D5694F904E197E9C550007BBB826C1A909DA",
"E7897F12B5AD4207E9ACCF64590267C84516CAE42D7E182768B64D8B9BA0DF2B7C5D3FCBD7F7C0111EF20C93BE19E9D6",
"F927FAC539C4C7E5508D4EF8B74F277AB15CB9E65EEFC0577017F3D2CAA09830F5958A09FF5C961F488D411877798EAA",
"E0E10BB5ACCC70766DCF6C829FC34C4032B8B3D1E27E65D0DE1F95461279845AC2DF611DA66EDEE3FD0FF0E6D10DCB2B",
"59AD268EA431C3FB8E17A4718A591E38DC7B9E56B539AA2A14F763A182118F40221E688C48DE3D968C25CB31ACC2ACC7",
"2DE636397D9E7D2D616790BEAEA3EEC06AFF73C3AC0984B79C8699151239A045896945CB162BDC4B01665297094A4FE7",
"31529DC52FACE5FD24723CFEF5345034828D18CC302F6565034A1CD0C618766DF561ACC0067856690F7E5C47EA155539",
"F4110D1D500DCC19D5416D4BAE78CFA169C05C3AC5E3F5593AAAA4F1165ACAB1C75E9CA73F6038C433B45ADCE0710102",
"8D344C1BD4BBD5B73EF555D2B476F6D7E88517296B27CA48C5FAAE2A3F0D9F188BBB505941CA40AB0B36CFD5291775A9",
"EE7B16AE89A129D4AA9FC0C0B8B3DF8D5365BC7C2D551D2587129A55179DAAA745D51123FB9C559E462F15A3EFCA6FD8",
"0CEC4A7043AD1A69D7B5E9FDB6E3A425CA740444AB31905BA22083797D541C2586E7A638806F00AE1B228600B2B0DEF8",
"893DB51F93FA78A449B33356F34A3DA65F99CB8DBD4FFFF49931DD2476D6696D98E7F7A2F3F1F4C9243F09278DDC5C18",
"626D65DC241C8E9906A4A063969D463799A834C085A6A538DB6FC744FBA29783BA8DB8AFBAE3BA6344FA8882E410E93C",
"DBDA1D4232FF9D58B9AFCF09F11E414F2BF582DE6EF001EA32DAE1DE1B9B3BE0BF4E20F724673485CABD01D4D829D4C8",
"A3D8B375434BBFEF44682525BB248A447EE660865B85901F64241D40905DA3AE0562B2864E4A845650AC0F8749ED7BF5",
"372FE994CE95AEEF30B40D03B9B4155F5ED4985CBE00F5AE517C12CA0A9971ED04FF344378D5FB20E08A724D4EBD40A7",
"08D8F3BF13DED5AD310FC0951A19851B07EC44739C1B3E6CA4DA5AFA5FBC3A3F4C988F431F751CA2E7BE8CDF23A2B3B9",
"653A2052B3F10F44A8D146E8C80D95B0E48548BB2977245F25423464396930F9822CBAFC2DA129AB1A5FDC9654F0AF32",
"AC0F167451CF6F6C80768A4378484E06F53A7559AFF0FD3C8B34B7C3EADBE23455B8676B36B0EEE0F05B799E4CF51546",
"53789C99FB457F7675706C6766098F5D254E2C931BEC54704DA9B7C8B9ABF30832EE805B30319E38502B9382AE620385",
"306170F4C90E90BD05E65F94690A89544205C54481F272BCC91FBDA9CCEE223428D7CEF4DB26BCDA4A6375B1B6BF202A",
"F12B3FDB77AD259CC41575AE0ADCA3ED92282EE0325C088823F42116EFFF2BD35FC6B9C750FF339211164D29180CD95E",
"46722E1BD68282ED9231F07484BEA06DECC739E8C0CF597DC37CB198A820B26D6F05E9DE437F70E2E5D962F28D7663B8",
"51A581D9184AC7374730D4F480D1090BB19963D8C0A1E3405BD81EE2E0BB9F6E7CDFCEA02F683F16ECC56731E69912A5",
"4B6EE95D7776F61D50A47329DA777DFDE72085FD874589A584B57F85C32F287C3911A508B41231A600B1E138CD63119E",
"F4D5251BEAAF57507CD89B6ED31D3E88DCB416E0EB97690A93A49E0AF8D8086D7B0738A12914DD60AF4FE3DEE685E484",
"0872E3B6BF94B4CAFEDF3DCA2FF6E05FA9C39C2C86404738B4267BD6A674D28FCBC1F92E8AC75BD10C1E0C8E56AEF1CD",
"EB139AFA75E8A4EA587757C311D1DEBA5DAB30706E1BB38424026E2AAA65F542733B4C086348C2E91304F0B44A7E64BD",
"BB321C30238C8B57C662303A619248E50758C44C33E373C872741C84B6772C6305C3B75DE983A0F5BEA513025F0E1D6A",
"5206EE0C3B9215047FA8F5C59C397CB9C929C49E64F996D87F1D39FEEA21EC6C672DBEA58555E8D1A066520660334948",
"6A10A409ACB83F520973031CF6C1EC6B392B173F43152986D28EF431869B1E2429A3942D248B9BE68AAF986AF06A37A2",
"85CB370FF441A8B9958325C10D703E65E1CE7AA37D5102E2FC068662C86B03F5BB46E9E273C25219B495824F4B59B603",
"983316748A7CCFACB361E0FE5D215B23FCCDFE41F1A23B6525E243E4151435DC4AD1AF1FFD4C9619025BAC570C4DCC70",
"1C298E1E0088E563B1959872742669CE68E14FB1E0E389A6AE7E30CDDC5AAD7F989943D2B649C4D245D417C216FA3FF2",
"5779FD171872A2E3DFC51C09BF4424B0FBF84794BB051A017166CC59F5689FC1425D2AFD96833B3B61256FCBC432C863",
"195FF9410BD955F1D4F8AE6DD08AAC4C51C34E5CAD26617CA4C9D1126E61DD41EF51700AF087647D2DBEF9CCFE0EC672",
"19D38CCB0A6643F5256A66C947D7BD48E3DE60180F6F320828FB88163AD7FB103F0FF1CAC7AAF743FC4EA10936EBBE6D",
"5C8F6B335A2F7930A0518CE0D8CA1E7C14B7275ADEED2838B64B96829A9260F02C5D9C931B6643E1C6A5F8574DCA7112",
"C3C2AB71C95A8EFFDDAEE26AC42695B7A8C72536A3F66CD13B547992C85ED6F77A94AB55531215131DA011BE45A3DBD9",
"F9E1F291EF8EAA48557D20BB43382FCFD5627E772FB8FF2A0AE91FCBD4ADACF7CB26BEEE808E1E3310A9C62DC85AB986",
"766DCBE49785ADFDDFA8D9851B69ACD50DA1AABCAF467CD5D68B258AE2CA806938E778B574DDE4A3C9CB40AFE125BE3D",
"9A95E8459E8F0FDBBE655C7937F9EF4A5C1F4E0C69BFD368D5F76555FCEB6535DEACF268ACAE4A273D7317FB955C42CE",
"8582B36B40BAD483890F960938B36E9CC027C4E94BB7374DD6A56CD9DB6E36B9CBB7F32BE3E89CD21C28A6EDAB018C91",
"643E184504A9A6E9144989D399C99026F3E2EAACF057BBABED7DF7A2F2DE824129A0D0D26CB3BBC82B6C349E8FFBB15B",
"FB486B721AB4B9AD91885184738D4B902EF5D94AA8E2D2DBA17ABDB63F012B0AD19057119FE6481EF90A2AC1ACD7F551",
"D02011628698D7C2DA32A87DDBCC71DBA24248A2DE01DE91F5D0680129A516D5B02A6867CB1C2A568CF231F974BBAE39",
"FA06F9E2B828001D534F5C159027CF2963AEF8C9E8F51025E939FD9F52E54901218C906C843AE6B31D16D23C4AD5CF24",
"4AF48C159CEAC819EBEDD123E2035AEE792FB6B77E09A7BFB0D449D8752BE821D0BE4CDBB3FCEC631B22E942A287BCE4",
"D328F6871549F6327E83D6840B1FC4EB7EEBCA58022B686AD5E5FFEC609A973795580900D1535B161319979D89333986",
"8F7CA3CC664B19BBE2A65C2A4AA705FE2516590095FBBD190E2B2BE194F1A032E4A20F1B5B635F928086AF3EACFF51E6",
"028D15E275E3554BAAFA4F23911E7D812C537FA426984CEF6FC74BCF9C4516700EBA886E6CF3E2424A23A72999913442",
"4258DC2E44CE3B9AD165B0CAB858FE9005B2182323C6424B49EBE894EF06F371C3752D96223EC75790BDB734EF38BEA4",
"CA647C9F6A23678960ED3B18C5DDE74D773B4F65123BF12CFAA14BC03642E9FBF4414508E609B1FF57319B89E84E1E28",
"A63BB6C90F17A3422A2482A161BD118C6DF70F542E6717144917635C1D8D53FB111D310AB6BA2EBD13DD79DEB7DF6A15",
"3C6D858C55DFD78A5040F75385DF5ACCCE3911789704B5AA224C3B02FA7067C504F75C2DDF03242C5CE7A56AB2E16B7D",
"F5E0F31B649BCBCAE8A735BF62A2ED791D8601CF4B81C09C0AA9F937FD8FAB05FF64549DEAFAC9AF1139908B52279A24",
"8F7B7D4492DEBEE39B6510D117C1A60983443DA137D96FE72404CB5C32E58929816DA5684A81B4CEC0F00E9BD24C0BCB",
"B5610C9CFEDDD86E94B2EFFCFCA526F2E3FF04038BAE581881B33DF94403FF747E1DBF501DA3012081D53F5C10FBD66E",
"DB8E227E82D8A2F0879CBE61203E36021A2C04DBF084D78DB3BE62D219D3316D795505D57C643243FDB0AAD12AB010F7",
"F1E3D414FAF379D71D72BBBA35A44CC16100C532DAC109606FEDA53E6EFF3C49522E41E340041000CA8A6ACBBFBC0308",
"EFBFFF9270287D63F34ECE5BB766E7E641CE01AF44115E22B286DA6D843403B475FF79203348282688CD121E4862CC1D",
"7B5E81829C36035C94435EE40370BDB69B604B3E4137D017127BFC540D5058DC4B451303884D8E6E93B337EC48B29979",
"3C58917AD57CC0EA3C822475B77CA7CE74E05AB52ECC41DA770CA392649A20E7629020861FFCBF864E1606BAF0E88D0A",
"C4E5AF0326D1D34E4C273CE380E90A17D8D659F4043B4A903E82F0FCCD2D984683F184DD500A6ACB41D298417B4295A9",
"2FAA52BA8F1E0F85325B038925996E10A9CD9169E26D7D7723FA3C96BB75D85A798BD7EF3638BD5387ED9518384362F8",
"9D59D243543870280D2CFF42D167985A6ED202D8455DC2DAAFC11522AA6FD4E3209DD8CDD9513B1464C416FD3C95D6FB",
"92103426DCD886409370A9757FCAD74C05F104B12978DBE6832C83E1156A08CCB74379DDDFCCBF9C29216CC84731FCE1",
"21C40E400AFFA5DD3F7F04472ADF763FEE4ED5D5DECBEC87E69326449C6BF00DDE0160BCC7C22324D5405C0B4B2691C9",
"7116824C07CF870C65B43366398254ED782857F2B3195CB1CF7C8DE52893D38D778CD874B0BA5F3035809D2FA6C82DD3",
"529EC5C68D06EB39EEAA4FD13517E153FA5D81BEECEAB9C6C1F5E6C94ACE51BEBA436BE21EA33701878CE177C1C0BBD4",
"52CB0B3C4409E0C2F365E54A1C3052DF5A88CDFE76E3AEB5DD5126928C570066A6D0AC52B52DD7FE7DF33CF92CBACFE3",
"04BC1F71951F75131C245C02B904B596B6EB71930C5D8F50150096E7FD69F8D08BEC948A8C21962AA4D0916EBE34803D",
"C0851E20F001187879A98650DB801DC732D53393A8A36790A5AE1F0695768996ED444B8B06C991AC4E5EAE77FA3A3097",
"98502FF0E116C2B31664450CB2EFD6F378E0CFFB8EE49F58A12D3180288491D0237D7DFC62B864B592056A702400754C",
"F357F34AEC46F6C08AEB7640EF99905494CCEE34BFE7D0FE3DE0E1CE967F9AC7DC220529D0BDD15004CC78E215141FCE",
"115095A0BB4B9F7ED259BCA07FCD617DADBEF439F8049D70C63BFECE7B94E4403DCD955DDA2D243BE809A84FC37EC132",
"BA208F9C55B8194FA319AAC75B4F5F8B5D680EF702FBA1BC57B5490EFF2C939753F2D25BCF299965D81EFAC9904F8006",
"C1AB67999885880FF911438A4B65C2109AAD3F67A6777FA3947ABD1D497B3AFEBC8A1557F6F924950A8AF96EE55DFBE6",
"5A4A278F9158D17823F6D5F8585965AF5CA7C1558D8EDDCF6D19ECDE6702EC0ED03975B79EA0B535FA601465E7081DA5",
"8F55220B94AB8DF93C2072C072AC06D7143198509D36C05B0B3813B564A648F2719D3AA1BB93CA1099F2BAFDA6977DDC",
"A301E58F619C7613842B7059FA3CDB820F685C4E62ECDB812E8FB6A0468A554E003ED0CA1BB29DB89CD5E6B8432B8B11",
"F2FDE74310791FF510AAFC509B7F25C9DE6D3E60BDBD1C0D5F5096E62033578316DC45920366CCB29739C2A32591EE41",
"50E9AD8E80759012C80B7C16C23FF89FE1FBF71ECDBDC14989860CB4FA5470A42A60BDB94FA79185CA29B2B5B2ED7F6F",
"044A87D6E9FAB3A58D572C7C2D4D87C2333294BFD8E6F7F7E7183DEE3FC6F29301D5AF79FC02933EF163BD16CA6EFAA2",
"3AD45BDDAC9C265F3E3F4ECFA501D1F36BF266B324EFFFEF1C867C6FC02931DED52DE291DDEDA6EE450F08F436492211",
"028E539B4AD4E2CF9919B05FCC8DEB4256756EA8C55E14CDDF3C910AFD7094A0D76D10F1D57A0E0997A68A69CCEA5098",
"ABBDF27DEB2ADABD431B6902781B7B3A2BB6DA57CD7CA7BE0AFCCF52D95AEAEB746E9BC7733FF9BAB7BA316D7D55C5D1",
"1CD4ECA7C3BF805F575DA7C2DB4BC046AB8EAC9F6470AB576B21AFA068B3EBDB033AF8CBAB2D8DF19473B64177B7090D",
"50F0882201C3FA3F78D03DB43EF1D5DB0EE363C743C0C3B782E4B336703F56456DDF7FAB45651680EDD05F2CCABB4895",
"87923B857D45EF5B987AA8774362C82B854E4A187996BF8050831B247760EC1F4BC4A696CF05CCD94D8C7C5DC51AF18F",
"A3EA96E2D605BF9840BF20AEF4D79286CFB0B855047B26648A64163CBAC5C3A388693FA4D87ACCF59D7D9CC39C906678",
"6BF88B97AC45469F5F66E4079B56331E4C809F70B325C96083D52C5DD6146193AA7F2AE9327C62243C1790AA5CB03CF8",
"09DAA2048FBCF11FCD2A4A447D7BA6CB330315643518E14387A037689050CE46FAFB5774E5F15C3786739D8C0C40ECA7",
"C113FC92DC9C2D7AC9C61AEC1EC105B5EDD9F054A442DCBC3121A1BF8211EE2AF08D09229C0018C77404C44D08E1786F",
"F00B2D82B91617569F821DED5B1E7B576B6B64A674C1064CB76504CE9712AC88C3E094770A198642F090E148FF9713B6",
"8EB0322C42165379F7A98167A1A0D1CE720566990DD8126889F9B030EECCCCA60B7E8CC2B830D8D3B58F57DD7AA1C0A5",
"7B81262D58DF23374E0DE73897144F9358FC95FB5413F880084CBA254E51EC704E5A9F66AEFBDC886ACADAFE9F27FF03",
"16979175EACB52128396BCBB109240A9459D7CB8AA28BB849387BEC9818DADB7CE3BEF86A62B807946362557C29A6D06",
"7DC4774CBCF3E9B8AD54B251E7B48FF1EDF4C081E5536E4FE2B23D5F66145E5F8EB0C7CC41F35ACAEDD97B539CD12F25",
"920F9A3C0C56D3C63B20E5636541F6F415B007FFCBDF060CCD7902F781F6B3B6CEE00DDA5192D915DD7B77D00D0028D3",
"55FFA4FFA4ECD5757CBCF8FC40D93A1FEC1419A2BB1C44F13FF34D269CCC1F4D747DB3B08C061D7E3AAE0CAEA01A33EB",
"F8E73BF3F447F673A5EFDB598EA240F4CC2D26A5AA7C2B03D20B40C8A51A394679CF938F2FC3F64926E64B22F885FFBC",
"E840EE697F356E3D37F0346FDD7A674E6E0017A5D99DE2D00678BFB8B5B3BD66E26535679B281B88F122CD2717048B3B",
"9A77925CFA9C78EE88EBC2164BC45596793D4469D5D13BB1C450746D4D7A237D0DDE6D5F21CE9FAE073B6812236E3720",
"EF80170AF5A885779459DA1F707EE92E024B0779AEEDFECCCCB1D4EB4E2A89576EEB2AD2CB82FCB004A6AEE6ECFE2150",
"5FDE76F173DC0A22B18EA8086C22BE731C9CB582A153D1F514473502A7346E17692507FFF6C2E38230415CE1F76F9967",
"1E64BA2D0E51AE222AA054C141EA4C3AC74225CA8D2BE095F4FE23FA988EC4E3FA1681878F2344ECAE440077B0A89CB1",
"EB7C10329B58DF7B620FFEEDB7BEF219B17B83F2DDF64A97FFF6BCD5CCE6E4B667DECE593B5ED8620D8E8C4E2989F0B5",
"A27E0F76A7EF0EDCEF4CAA1AC250B3EBC2FDAAC2F1B43C8353722FAFD023A566EDFDB9D5058537ED59C97B09CD6FCC1A",
"2796ACC2E0BC11F89C99F77315954FAE7E3C2739302C8B4E7EFE916A70F6BA5A368F390B0CFDDB37742FBE6ED5084E93",
"66D2846B807AD0062523167797C0CF03A1E06731AD6B6B4942259594E2BFA5185E2710F688FA3C1AD0581BA1C217B952",
"D93AF9B205F6511CDA359FA02EACBD34CE01EB42966FA680FFFE73B0111A4548CD51ACC840BFB04034E7A555BB419BF9",
"99CAE8204F0BDABC467EBF35303F64F4C35F2941DA96572E9350229AF24612DB756884D1CC4D416CC6EA5D98D3EB5A4D",
"054593395F7B2ACEA50E29493699A8A44FE5CA40F7D404ED1E5B1A9F7415AF1C92834EEA1E10CC08F2BDCCCA517991DD",
"CC774188771ACF356E96B2D8D22CCB1A984D7B4CAE642F3B1942387692B3496B28D2A318F02286F76167B1B1794EAD23",
"33626D7D4A62A75F2B9CAA3BB49C16313B76AC4BFC1D3A937D8796E39014319B66D49D6FD30238242B2F5693C20604CD",
"2B54B8EDCC37E2DFDF1AD6A532D5B39E18E2AAF599C5365B9B065802F30FCE2EDBE9E459BCB87B96775D8C650D8DE581",
"EFD98E935F04DB2C24031980BF2FAB619DBDDD933AB8C0D125F91FFB98AD021680AF82223B02C4B6DF7520B1BC1F6B74",
"219DDE87EE3BC851F04F192724301BC4FDC45C315ACF7B93772ACC9A714983C8CE64841086831FBE4E2DC349888AC912"
];
