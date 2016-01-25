var createHash = require('sha.js');

var colors = [
"#ff0000",
"#0000ff",
"#00ff00",
"#ffff00",
"#ff8c00",
"#ffffff",
"#ff00ff",
"#008b8b"
];

var ColorHash = function(key) {
    var hash = createHash("sha256");
    hash.update(key, "utf8");
    var data = hash.digest();
    var b = data.readUInt8(0);
    var colorCode = b % colors.length;
    return colors[colorCode];
}

module.exports = ColorHash;