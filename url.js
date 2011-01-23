/* jscrypto library, url utility
 *   by GUAN Zhi <guanzhi at guanzhi dot org>
 */

function url_get_fragid() {
	var url = String(window.location);
	var index = url.indexOf("#");
	return index >= 0 ? url.substr(index + 1) : null;
}

