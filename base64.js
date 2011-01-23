/* jscrypto library, base64 encoding/decoding
 *   by GUAN Zhi <guanzhi at guanzhi dot org>
 */
 
var B64MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function base64_encode(bytes) {
	var i = 0; j = 0;
	var append = bytes.length % 3 > 0 ? 3 - bytes.length % 3 : 0;
	for (i = 0; i < append; i++) {
		bytes[bytes.length] = 0;
	}
	var b64 = "";
	for (i = 0; j < bytes.length; j += 3) {
		if (j > 0 && j % 57 == 0) {
			b64 += '\n';
		}
		b64 += B64MAP[bytes[j] >> 2]
			+ B64MAP[(bytes[j] & 3) << 4 | bytes[j+1] >> 4]
			+ B64MAP[(bytes[j+1] & 15) << 2 | bytes[j+2] >> 6]
			+ B64MAP[bytes[j+2] & 63];
	}
	for (i = 0; i < append; i++) {
		b64 += '=';
	}
	return b64;
}

function base64_decode(input)
{
	var i = 0, j = 0;
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	var append = input.length % 4;
	if (append > 2) {
		return "shit1";
	}
	for (i = 0; i < append; i++) {
		if (input.charAt(input.length - i - 1) != '=') {
			return "shit2";
		}
	}
	var output = new Array((input.length - append) * 3 / 4);
	var enc1, enc2, enc3, enc4;
	for (i = 0, j = 0; j < output.length;) {
		enc1 = B64MAP.indexOf(input.charAt(i++));
		enc2 = B64MAP.indexOf(input.charAt(i++));
		enc3 = B64MAP.indexOf(input.charAt(i++));
		enc4 = B64MAP.indexOf(input.charAt(i++));
		output[j++] = (enc1 << 2) | (enc2 >> 4);
		output[j++] = ((enc2 & 15) << 4) | (enc3 >> 2);
		output[j++] = ((enc3 & 3) << 6) | enc4;
	}
	for (i = 0; i < append; i++) {
		if (output.pop() != 0) {
			return "shit3";
		}
	}
	return output;
}





