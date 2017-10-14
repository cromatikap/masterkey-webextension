var MasterKey = require("./masterkey.js");
var ColorHash = require("./colorhash.js");

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

    /**
     * genKey reads input data and generates a password and sets the password field's value to this password
     */
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

    /**
     * Triggered when enter is pressed in a field. Sends password to background script which decides what happens next
     */
    function submit() {
        browser.runtime.sendMessage({ "password": inputs.password.value });
    }

    /**
     * Show password in clear text
     * @param {bool} show true if password should be shown, false otherwise
     */
    function showPassword(show) {
        config.show = show;
        if (show) {
            inputs.password.type = "text";
            buttons.show.className = "enabled";
        } else {
            inputs.password.type = "password";
            config.show = false;
            buttons.show.className = "";
        }
        browser.storage.local.set({"show": config.show});
    }

    /**
     * Set maximum password length
     * @param {int} length 
     */
    function setLength(length) {
        config.passwordlength = length;
        inputs.passwordlength.value = length;
        browser.storage.local.set({"length": length});
        genKey();
    }

    /**
     * Should special characters be allowed?
     * @param {*} special 
     */
    function setSpecial(special) {
        config.special = special;
        if (special) buttons.special.className = "enabled";
        else buttons.special.className = "";
        browser.storage.local.set({"special": special});
        genKey();
    }

    /**
     * Set master key in config
     * @param {string} masterkey 
     * @param {bool} setField true if masterkey input value should be changed
     */
    function setMasterKey(masterkey, setField) {
        config.masterkey = masterkey;
        var color = "#000";
        if (masterkey != "") {
            color = ColorHash(masterkey);
        }
        if (setField) inputs.masterkey.value = masterkey;

        colorHashIndicator.style.background = color;
        browser.runtime.sendMessage({ "masterkey": masterkey});        
        genKey();
    }

    inputs.masterkey.oninput = function () {
        setMasterKey(inputs.masterkey.value, false);
    };

    inputs.masterkey.onkeydown = function (ev) {
        if (ev.keyCode === 13) {
            submit();
            return false;
        }
        return true;
    };

    inputs.service.onkeydown = inputs.masterkey.onkeydown;

    inputs.service.oninput = function () {
        browser.runtime.sendMessage({"service": inputs.service.value}); // Send service name to background script to cache
        genKey();
    };

    inputs.passwordlength.oninput = function () {
        setLength(this.value);
    };

    buttons.special.onclick = function (ev) {
        setSpecial(!config.special);
    };

    buttons.show.onclick = function (ev) {
        showPassword(!config.show);
    };

    buttons.save.onclick = function () {
        browser.storage.local.set({ "masterkey": inputs.masterkey.value }); // Save masterkey in local storage
    }

    browser.runtime.onMessage.addListener(function (msg) {
        if (msg == "copy") {
            // Writing to clipboard in a webextension requires a hacky solution in which you display it in cleartext for a short time
            // Thank Mozilla and Google, I guess
            var showedBefore = config.show;
            if (!config.show) showPassword(true);
            inputs.password.select();
            document.execCommand("copy");
            if (!showedBefore) showPassword(false);
            window.close();
        } else if (msg == "close") { // Received when password is written to input field
            window.close();            
        }
    })

    var masterkeyFromInit = false;

    browser.runtime.sendMessage("init").then(function (msg) {
        if ("masterkey" in msg && msg.masterkey != "") {
            setMasterKey(msg.masterkey, true);
            masterkeyFromInit = true;
        }
        if ("service" in msg) {
            inputs.service.value = msg.service;
            genKey();
        }
    });


    // Check if settings were saved previously
    browser.storage.local.get(["length", "special", "show", "masterkey"]).then(function(data) {
        if ("length" in data) setLength(data.length);
        if ("special" in data) setSpecial(data.special);
        if ("show" in data) showPassword(data.show);
        if ("masterkey" in data && !masterkeyFromInit && data.masterkey != "") setMasterKey(data.masterkey, true);
    });

    // Notify background script that the popup has been closed
    window.onunload = function() {
        browser.runtime.sendMessage("close");
    }