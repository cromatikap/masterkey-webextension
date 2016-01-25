var MasterKey = require("./masterkey");
var ColorHash = require("./colorhash");


+function() {
    var buttons = {
        copy: document.getElementById("button-copy"),
        show: document.getElementById("button-show"),
        special: document.getElementById("button-special"),
        save: document.getElementById("button-save")
    };

    var inputs = {
        masterkey: document.getElementById("masterkey"),
        service: document.getElementById("service"),
        password: document.getElementById("password"),
        passwordlength: document.getElementById("length")
    };

    var colorHashIndicator = document.getElementById("colorhash");

    var config = {
        special: true,
        passwordlength: 20,
        show: false
    };

    function genKey() {
        var key = inputs.masterkey.value;
        var service = inputs.service.value;
        var length = config.passwordlength;
        var special = config.special;

        var password = "";

        if (key != "" && service != "") {
            password = MasterKey(key, service, special, length);
        }

        inputs.password.value = password;
    }

    function submit() {
        self.port.emit("password", inputs.password.value);
    }

    inputs.masterkey.oninput = function() {
        var key = inputs.masterkey.value;
        var color = "#000";
        if (key != "") {
            color = ColorHash(key);
        }

        colorHashIndicator.style.background = color;

        genKey();
    };

    inputs.masterkey.onkeydown = function(ev) {
        if (ev.keyCode === 13) {
            submit();
            return false;
        }
        return true;
    };

    inputs.service.onkeydown = inputs.masterkey.onkeydown;

    inputs.service.oninput = function() {
        genKey();
    };

    inputs.passwordlength.oninput = function() {
        config.passwordlength = this.value;
        self.port.emit("setting", {"prop": "passwordlength", "value": config.passwordlength});
        genKey();
    };

    buttons.special.onclick = function(ev) {
        if (config.special) {
            this.className = "";
            config.special = false;
        } else {
            this.className = "enabled";
            config.special = true;
        }
        self.port.emit("setting", {"prop": "special", "value": config.special});
        genKey();
    };

    buttons.show.onclick = function(ev) {
        if (config.show) {
            this.className = "";
            inputs.password.type = "password";
            config.show = false;
        } else {
            this.className = "enabled";
            inputs.password.type = "text";
            config.show = true;
        }
        self.port.emit("setting", {"prop": "show", "value": config.show});
    };

    buttons.save.onclick = function() {
        self.port.emit("masterkey", inputs.masterkey.value);
    }

    self.port.on("show", function(properties) {
        config.passwordlength = properties.passwordlength;
        inputs.passwordlength.value = config.passwordlength;
        config.show = properties.show;
        buttons.show.className = (config.show)?"enabled":"";
        config.special = properties.special;
        buttons.special.className = (config.special)?"enabled":"";

        genKey();

        if (inputs.masterkey.value === "") {
            inputs.masterkey.focus();
        } else {
            inputs.service.focus();
            inputs.service.select();
        }
    });

    self.port.on("masterkey", function(key) {
        inputs.masterkey.value = key;
        genKey();
    })
}();