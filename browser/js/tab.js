self.port.on("password", function(data) {
    var element = document.getElementsByClassName(data.id);
    if (element.length == 0) return;

    element = element[0];

    element.value = data.pw;
});
