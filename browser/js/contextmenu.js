function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

self.on("click", function(node) {
    var identifier;
    do {
        identifier = randomString(50, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    } while (document.getElementsByClassName(identifier).length != 0);

    node.className += " " + identifier;
    self.postMessage(identifier);
})