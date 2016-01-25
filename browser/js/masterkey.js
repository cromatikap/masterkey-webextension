var createHmac = require('create-hmac');
var ascii85 = require("ascii85");
var base62 = require("./lib/base62")

var MasterKey = function(key, service, special, length) {
    var hmac = createHmac("sha256", key);

    hmac.update(service);

    var buf = hmac.digest();

    var password;

    if (special) {
        password = ascii85.encode(buf);
    } else {
        password = base62.encodeBase62ToString(buf);
    }

    return password.substr(0, length);
}

module.exports = MasterKey;